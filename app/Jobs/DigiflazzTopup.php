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
    public int $tries = 1; // ⛔ queue retry dimatikan

    public function __construct(int $orderId)
    {
        $this->orderId = $orderId;
    }

    public function handle()
    {
        $order = Transaction::with('product')->find($this->orderId);
        if (! $order || $order->digiflazz_status === 'Sukses') {
            return;
        }

        $lock = Cache::lock("digiflazz_{$order->order_id}", 300);
        if (! $lock->get()) return;

        try {

            // ⏰ CUTOFF
            if ($order->product && $this->isProductCutoff($order->product)) {
                $this->pending($order, 'Cutoff produk');
                return;
            }

            // 💰 DEBIT SEKALI
            if (! $order->saldo_debited_at) {
                DigiflazzBalanceService::debit($order->purchase_price);
                $order->update(['saldo_debited_at' => now()]);
            }

            // 🟡 PROCESSING
            $order->update(['digiflazz_status' => 'processing']);

            // 📤 HIT DIGIFLAZZ
            $res = Http::timeout(20)->post(
                'https://api.digiflazz.com/v1/transaction',
                [
                    'username' => config('services.digiflazz.username'),
                    'buyer_sku_code' => $order->buyer_sku_code,
                    'customer_no' => $order->customer_no,
                    'ref_id' => $order->order_id,
                    'sign' => md5(
                        config('services.digiflazz.username') .
                        config('services.digiflazz.prod_key') .
                        $order->order_id
                    ),
                ]
            );

            $data = $res->json('data') ?? [];

            // ✅ SUKSES LANGSUNG
            if (($data['rc'] ?? '') === '00') {
                $order->update([
                    'digiflazz_status' => 'Sukses',
                    'status_message' => $data['message'],
                    'digiflazz_response' => $data,
                ]);
                return;
            }

            // ❌ GAGAL PERMANEN
            if (in_array($data['rc'] ?? '', ['40','41','42'])) {
                DigiflazzBalanceService::credit($order->purchase_price);

                $order->update([
                    'digiflazz_status' => 'failed',
                    'status_message' => $data['message'],
                ]);
                return;
            }

            // ⏳ PENDING (MENUNGGU WEBHOOK)
            $this->pending($order, $data['message'] ?? 'Menunggu Digiflazz');

        } catch (\Throwable $e) {

            $this->pending($order, 'Gangguan Digiflazz');

            Log::error('DigiflazzTopup error', [
                'order_id' => $order->order_id,
                'error' => $e->getMessage(),
            ]);

        } finally {
            $lock->release();
        }
    }

    private function pending(Transaction $order, string $msg)
    {
        $order->increment('retry_count');

        if ($order->retry_count >= 5) {
            DigiflazzBalanceService::credit($order->purchase_price);

            $order->update([
                'digiflazz_status' => 'failed',
                'status_message' => 'Gagal setelah 5x percobaan',
            ]);
            return;
        }

        $order->update([
            'digiflazz_status' => 'pending',
            'status_message' => $msg,
            'retry_at' => now()->addMinutes(10),
        ]);
    }

    private function isProductCutoff($product): bool
{
    // ❌ Tidak ada produk / tidak set cutoff
    if (! $product || ! $product->start_cut_off || ! $product->end_cut_off) {
        return false;
    }

    // ⏰ WAKTU WIB
    $now = Carbon::now('Asia/Jakarta');

    $start = Carbon::createFromFormat(
        'H:i:s',
        $product->start_cut_off,
        'Asia/Jakarta'
    );

    $end = Carbon::createFromFormat(
        'H:i:s',
        $product->end_cut_off,
        'Asia/Jakarta'
    );

    // 🌙 LINTAS HARI (contoh: 23:30 - 00:30)
    if ($start->gt($end)) {
        return $now->gte($start) || $now->lte($end);
    }

    // ☀️ NORMAL (contoh: 01:00 - 05:00)
    return $now->between($start, $end);
}

}

