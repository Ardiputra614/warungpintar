<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;

class WaSendService
{
    public function WaSend(Transaction $transaction): bool
    {
        if (! $transaction->wa_pembeli) {
            Log::warning('WA tidak dikirim, nomor kosong', [
                'transaction_id' => $transaction->id
            ]);
            return false;
        }

        $template = "✅ *Transaksi Berhasil!*\n\n" .
            "🧾 Produk : {$transaction->product_name}\n" .
            "💳 Nominal : Rp " . number_format($transaction->gross_amount, 0, ',', '.') . "\n" .
            "📱 Nomor Tujuan : {$transaction->wa_pembeli}\n" .
            "🕒 Waktu : {$transaction->updated_at}\n\n" .
            "Terima kasih telah menggunakan layanan kami 🙏";

        $response = Http::withHeaders([
            'Authorization' => env('FONNTE_TOKEN')
        ])->post('https://api.fonnte.com/send', [
            'target'  => $this->formatPhone($transaction->wa_pembeli),
            'message' => $template,
        ]);

        if (! $response->successful()) {
            Log::error('Gagal kirim WA', [
                'response' => $response->body()
            ]);
            return false;
        }

        return true;
    }

    private function formatPhone(string $phone): string
    {
        // 08xxxx → 628xxxx
        if (str_starts_with($phone, '08')) {
            return '62' . substr($phone, 1);
        }
        return $phone;
    }
}
