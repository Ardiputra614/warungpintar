<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WaSendController extends Controller
{
    public function WaSend($data)
    {        
        $template = "✅ Transaksi Berhasil!

Hai {$data['nama']}, pesanan Anda telah berhasil.

🧾 Produk : {$data['product_name']}
💳 Nominal : Rp " . number_format($data['gross_amount'], 0, ',', '.') . "
📱 Nomor Tujuan : {$data['wa_pembeli']}
🕒 Waktu : {$data['updated_at']}

Terima kasih telah menggunakan layanan kami! 😊";

    $response = Http::withHeaders([
        'Authorization' => env('FONNTE_TOKEN')
    ])->post('https://api.fonnte.com/send', [
        'target' => $data['tujuan'], // contoh: 6281234567890
        'message' => $template,
    ]);

    return $response->json();
    }
}
