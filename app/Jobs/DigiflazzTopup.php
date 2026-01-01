<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Services\DigiflazzBalanceService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DigiflazzTopup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $orderId;
    public int $tries = 5;
    public int $backoff = 120;

    public function __construct(int $orderId)
    {
        $this->orderId = $orderId;
    }

    public function handle()
    {
        $order = Transaction::find($this->orderId);

        if (! $order || $order->digiflazz_status === 'Sukses') {
            return;
        }

        $refId = $order->order_id;
        $lock = Cache::lock("digiflazz_order_$refId", 300);

        if (! $lock->get()) return;

        try {
            // ⏰ CUTOFF PRODUK
            if ($this->isProductCutoff($order->product)) {
                $this->setPending($order, 'Cutoff produk');
                return;
            }

            // 🔒 DEBIT SALDO
            DigiflazzBalanceService::debit($order->purchase_price);

            // 📤 HIT DIGIFLAZZ
            $res = Http::timeout(20)->post(
                'https://api.digiflazz.com/v1/transaction',
                [
                    'username' => env('DIGIFLAZZ_USERNAME'),
                    'buyer_sku_code' => $order->buyer_sku_code,
                    'customer_no' => $order->customer_no,
                    'ref_id' => $refId,
                    'sign' => md5(
                        env('DIGIFLAZZ_USERNAME') .
                        env('DIGIFLAZZ_PROD_KEY') .
                        $refId
                    ),
                ]
            );

            $data = $res->json('data') ?? [];

            // ✅ SUKSES
            if (($data['rc'] ?? '') === '00') {
                $order->update([
                    'digiflazz_status' => 'Sukses',
                    'status_message' => $data['message'],
                    'digiflazz_response' => $data,
                ]);
                return;
            }

            // ⏳ CUTOFF DIGIFLAZZ
            if ($this->isApiCutoff($data)) {
                DigiflazzBalanceService::credit($order->purchase_price);
                $this->setPending($order, $data['message'] ?? 'Cutoff Digiflazz');
                return;
            }

            throw new \Exception($data['message'] ?? 'Topup gagal');

        } catch (\Throwable $e) {
            DigiflazzBalanceService::credit($order->purchase_price);

            $order->update([
                'digiflazz_status' => 'failed',
                'status_message' => $e->getMessage(),
            ]);

            throw $e;

        } finally {
            optional($lock)->release();
        }
    }

    // ================= HELPERS =================

    private function isApiCutoff(array $data): bool
    {
        return str_contains(strtolower($data['message'] ?? ''), 'cut')
            || in_array($data['rc'] ?? '', ['58', '66']);
    }

    private function isProductCutoff($product): bool
    {
        if (! $product || ! $product->start_cutoff || ! $product->end_cutoff) {
            return false;
        }

        $now = Carbon::now();
        $start = Carbon::createFromFormat('H:i:s', $product->start_cutoff);
        $end   = Carbon::createFromFormat('H:i:s', $product->end_cutoff);

        // lintas hari (23:30 - 00:30)
        if ($start->greaterThan($end)) {
            return $now->gte($start) || $now->lte($end);
        }

        return $now->between($start, $end);
    }

    private function setPending(Transaction $order, string $message): void
    {
        $order->increment('retry_count');

        $order->update([
            'digiflazz_status' => 'pending',
            'retry_at' => $this->nextRetry(),
            'status_message' => $message,
        ]);
    }

    private function nextRetry(): Carbon
    {
        return now()->hour >= 23
            ? now()->addDay()->setTime(0, 35)
            : now()->addMinutes(10);
    }
}
