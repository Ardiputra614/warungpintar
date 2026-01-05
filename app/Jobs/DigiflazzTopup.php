<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Models\ProfilAplikasi;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DigiflazzTopup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $orderId;
    public int $tries = 5;
    public int $timeout = 300;

    public function backoff(): array
    {
        return [60, 180, 300, 600, 900];
    }

    public function __construct(int $orderId)
    {
        $this->orderId = $orderId;
    }

    public function handle()
    {
        $order = Transaction::with('product')->lockForUpdate()->find($this->orderId);
        
        if (!$order) {
            Log::error('Order not found', ['order_id' => $this->orderId]);
            return;
        }

        if (in_array($order->digiflazz_status, ['Sukses', 'cancelled'])) {
            return;
        }

        $lock = Cache::lock("digiflazz_topup_{$order->order_id}", 300);
        
        if (!$lock->get()) {
            Log::warning('Lock tidak bisa didapat', ['order_id' => $order->order_id]);
            return;
        }

        try {
            $this->processTopup($order);
        } catch (\Throwable $e) {
            $this->handleException($order, $e);
        } finally {
            $lock->release();
        }
    }

    private function processTopup(Transaction $order): void
    {
        // CEK CUTOFF
        if ($this->isProductCutoff($order->product)) {
            $order->update([
                'digiflazz_status' => 'pending',
                'status_message' => 'Produk sedang cutoff',
                'retry_at' => now()->addMinutes(10),
            ]);
            $this->release(600);
            return;
        }

        // DEBIT SALDO SEKALI SAJA
        if (!$order->saldo_debited_at) {
            $this->debitSaldo($order);
        }

        // HIT API DIGIFLAZZ
        $this->hitDigiflazzApi($order);
    }

    private function debitSaldo(Transaction $order): void
    {
        DB::transaction(function () use ($order) {
            // Lock ProfilAplikasi untuk prevent race condition
            $profil = ProfilAplikasi::lockForUpdate()->first();
            
            if (!$profil) {
                Log::error('ProfilAplikasi tidak ditemukan');
                $order->update([
                    'digiflazz_status' => 'failed',
                    'status_message' => 'Konfigurasi aplikasi tidak ditemukan',
                    'last_error_code' => 'NOPROF',
                ]);
                $this->delete();
                return;
            }

            // CEK SALDO
            if ($profil->saldo < $order->purchase_price) {
                Log::error('Saldo aplikasi tidak mencukupi', [
                    'saldo_tersedia' => $profil->saldo,
                    'saldo_dibutuhkan' => $order->purchase_price,
                ]);
                
                $order->update([
                    'digiflazz_status' => 'failed',
                    'status_message' => 'Saldo aplikasi tidak mencukupi',
                    'last_error_code' => 'INSUFF',
                ]);
                $this->delete();
                return;
            }

            // POTONG SALDO
            $saldoSebelum = $profil->saldo;
            $profil->decrement('saldo', $order->purchase_price);
            
            Log::info('Saldo aplikasi berhasil dipotong', [
                'order_id' => $order->order_id,
                'saldo_sebelum' => $saldoSebelum,
                'dipotong' => $order->purchase_price,
                'saldo_setelah' => $profil->fresh()->saldo,
            ]);

            // UPDATE ORDER
            $order->update([
                'saldo_debited_at' => now(),
                'digiflazz_status' => 'processing',
                'status_message' => 'Saldo dipotong, memproses transaksi...',
            ]);
        });
    }

    private function refundSaldo(Transaction $order): void
    {
        DB::transaction(function () use ($order) {
            $profil = ProfilAplikasi::lockForUpdate()->first();
            
            if (!$profil) {
                Log::error('ProfilAplikasi tidak ditemukan untuk refund');
                return;
            }

            // KEMBALIKAN SALDO
            $saldoSebelum = $profil->saldo;
            $profil->increment('saldo', $order->purchase_price);
            
            Log::info('Saldo aplikasi berhasil dikembalikan', [
                'order_id' => $order->order_id,
                'saldo_sebelum' => $saldoSebelum,
                'dikembalikan' => $order->purchase_price,
                'saldo_setelah' => $profil->fresh()->saldo,
            ]);
        });
    }

    private function hitDigiflazzApi(Transaction $order): void
    {
        $payload = $this->buildPayload($order);

        Log::info('Mengirim request ke Digiflazz', [
            'order_id' => $order->order_id,
        ]);

        $order->update(['digiflazz_sent_at' => now()]);

        $timeout = $this->getApiTimeout($order->product);
        $response = Http::timeout($timeout)
            ->retry(2, 100)
            ->post('https://api.digiflazz.com/v1/transaction', $payload);

        $order->update([
            'digiflazz_request' => $payload,
            'digiflazz_response' => $response->json(),
        ]);

        $this->handleApiResponse($order, $response);
    }

    private function handleApiResponse(Transaction $order, $response): void
    {
        $data = $response->json('data') ?? [];
        $rc = $data['rc'] ?? null;
        $message = $data['message'] ?? 'Unknown response';

        Log::info('Response dari Digiflazz', [
            'order_id' => $order->order_id,
            'rc' => $rc,
            'message' => $message,
        ]);

        match ($rc) {
            '00' => $this->handleSuccess($order, $data),
            '201' => $this->handlePending($order, $message),
            '40', '41', '42', '43', '44', '45' => $this->handleFailed($order, $message, $rc),
            '06', '07', '08', '17', '39' => $this->handleRetryable($order, $message, $rc),
            default => $this->handleUnknown($order, $message, $rc),
        };
    }

    private function handleSuccess(Transaction $order, array $data): void
    {
        $order->update([
            'digiflazz_status' => 'Sukses',
            'status_message' => 'Transaksi berhasil',
            'serial_number' => $data['sn'] ?? null,
            'ref_id' => $data['ref_id'] ?? $order->order_id,
        ]);

        Log::info('✅ Transaksi sukses', ['order_id' => $order->order_id]);
    }

    private function handlePending(Transaction $order, string $message): void
    {
        $order->update([
            'digiflazz_status' => 'pending',
            'status_message' => $message,
        ]);

        Log::info('⏳ Menunggu callback', ['order_id' => $order->order_id]);
    }

    private function handleFailed(Transaction $order, string $message, ?string $rc): void
    {
        // REFUND SALDO (cek dulu udah direfund belum lewat status)
        if ($order->saldo_debited_at && $order->digiflazz_status !== 'refunded') {
            $this->refundSaldo($order);
            
            Log::info('💸 Saldo aplikasi telah dikembalikan', [
                'order_id' => $order->order_id,
                'amount' => $order->purchase_price,
            ]);
        }

        $order->update([
            'digiflazz_status' => 'refunded',
            'status_message' => $message,
            'last_error_code' => $rc,
        ]);

        Log::error('❌ Transaksi gagal & refunded', [
            'order_id' => $order->order_id,
            'rc' => $rc,
        ]);
    }

    private function handleRetryable(Transaction $order, string $message, ?string $rc): void
    {
        $order->increment('retry_count');

        if ($order->retry_count >= 5) {
            $this->handleFailed($order, 'Gagal setelah 5x retry', $rc);
            return;
        }

        $order->update([
            'digiflazz_status' => 'pending',
            'status_message' => $message,
            'last_error_code' => $rc,
            'retry_at' => now()->addMinutes(10),
        ]);

        $this->release(600);

        Log::warning('⚠️ Retry transaksi', [
            'order_id' => $order->order_id,
            'retry_count' => $order->retry_count,
        ]);
    }

    private function handleUnknown(Transaction $order, string $message, ?string $rc): void
    {
        $order->update([
            'digiflazz_status' => 'pending',
            'status_message' => $message,
            'last_error_code' => $rc,
            'retry_at' => now()->addMinutes(10),
        ]);

        Log::error('❓ Response code tidak dikenali', [
            'order_id' => $order->order_id,
            'rc' => $rc,
        ]);
    }

    private function handleException(Transaction $order, \Throwable $e): void
    {
        Log::error('Exception saat processing', [
            'order_id' => $order->order_id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        $order->increment('retry_count');
        
        if ($order->retry_count >= 5) {
            $this->handleFailed($order, 'Error: ' . $e->getMessage(), 'EXCEPT');
            return;
        }

        $order->update([
            'digiflazz_status' => 'pending',
            'status_message' => 'Gangguan sistem',
            'retry_at' => now()->addMinutes(10),
        ]);

        throw $e;
    }

    private function buildPayload(Transaction $order): array
    {
        $username = config('services.digiflazz.username');
        $prodKey = config('services.digiflazz.prod_key');

        return [
            'username' => $username,
            'buyer_sku_code' => $order->buyer_sku_code,
            'customer_no' => $order->customer_no,
            'ref_id' => $order->order_id,
            'sign' => md5($username . $prodKey . $order->order_id),
        ];
    }

    private function isProductCutoff($product): bool
    {
        if (!$product || !$product->start_cut_off || !$product->end_cut_off) {
            return false;
        }

        $now = Carbon::now('Asia/Jakarta');
        $start = Carbon::createFromFormat('H:i:s', $product->start_cut_off, 'Asia/Jakarta');
        $end = Carbon::createFromFormat('H:i:s', $product->end_cut_off, 'Asia/Jakarta');

        if ($start->gt($end)) {
            return $now->gte($start) || $now->lte($end);
        }

        return $now->between($start, $end);
    }

    private function getApiTimeout($product): int
    {
        $slowProviders = ['PLN', 'BPJS', 'TELKOM'];
        
        if ($product && in_array($product->category, $slowProviders)) {
            return 60;
        }

        return 30;
    }

    public function failed(\Throwable $exception): void
    {
        $order = Transaction::find($this->orderId);
        
        if ($order) {
            $this->handleFailed($order, 'Job failed: ' . $exception->getMessage(), 'JOBFAIL');
        }
    }
}