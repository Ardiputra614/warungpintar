<?php

namespace App\Jobs;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http as HttpClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DigiflazzTopup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $order;

    public $tries = 5; // total max attempts
    public $backoff = 120; // delay antar retry dalam detik (2 menit)

    public function __construct(Transaction $order)
    {
        $this->order = $order;
    }

    public function handle(): void
    {
        $refId = $this->order->order_id;
        $signature = md5(env('DIGIFLAZZ_USERNAME') . env('DIGIFLAZZ_PROD_KEY') . $refId);

        $response = Http::post('https://api.digiflazz.com/v1/transaction', [
            "username" => env('DIGIFLAZZ_USERNAME'),
            "buyer_sku_code" => $this->order->buyer_sku_code,
            "customer_no" => $this->order->customer_no,
            "ref_id" => $refId,
            "testing" => false,
            "sign" => $signature,
        ]);

        $responseData = json_decode($response, true);

        if (($responseData['data']['rc'] ?? null) == '00') {
            Cache::forget('transkey_' . $refId);
            Log::info("✅ Topup success for order {$refId}.");

            $this->order->update([
                'status' => 'success',
                'message' => $responseData['data']['message'] ?? 'Topup berhasil'
            ]);

            // Kirim notifikasi via Fonnte
            $this->sendWhatsAppNotification("Topup berhasil untuk order ID: {$refId}");

        } else {
            $error = $responseData['data']['message'] ?? 'Unknown error';
            Log::warning("❌ Topup failed for order {$refId}. Reason: {$error}");

            $this->order->update([
                'status' => 'failed',
                'message' => $error,
            ]);

            // Jika attempt terakhir dan tetap gagal, kirim notifikasi ke admin (opsional)
            if ($this->attempts() >= $this->tries) {
                Log::error("🚨 Max retry reached for order {$refId}");
                $this->sendWhatsAppNotification("Topup GAGAL untuk order {$refId} setelah beberapa kali percobaan.");
            }

            // Akan retry otomatis berdasarkan konfigurasi Laravel (tries dan backoff)
            throw new \Exception("Topup gagal, akan dicoba ulang...");
        }
    }

    protected function sendWhatsAppNotification($message): void
    {
        $response = HttpClient::withHeaders([
            'Authorization' => 'Bearer ' . env('FONNTE_TOKEN'),
        ])->post('https://api.fonnte.com/send', [
            'target' => $this->order->user->phone ?? env('ADMIN_PHONE'),
            'message' => $message,
        ]);

        Log::info('📩 WA notification sent. Response: ' . $response->body());
    }
}
