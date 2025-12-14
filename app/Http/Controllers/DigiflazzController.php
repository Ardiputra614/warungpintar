<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Transaction;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DigiflazzController extends Controller
{
    public function getProducts(Request $request)
{
    $header = ['Content-Type' => 'application/json'];
    $apiUrl = "https://api.digiflazz.com/v1/price-list";
    $apiKey = env('DIGIFLAZZ_PROD_KEY');
    $username = env('DIGIFLAZZ_USERNAME');

    $data = [
        'cmd' => 'prepaid',
        'username' => $username,
        'sign' => md5($username . $apiKey . "pricelist")
    ];

    $response = Http::withHeaders($header)->post($apiUrl, $data);
    
    if ($response->successful()) {
        $responseData = $response->json();
        
        // VALIDASI PENTING: Pastikan data adalah array
        if (!isset($responseData['data']) || !is_array($responseData['data'])) {
            return response()->json([
                'error' => 'Invalid API response structure',
                'response' => $responseData
            ], 500);
        }
        
        foreach ($responseData['data'] as $product) {
    // Cuma 2 validasi penting
    $buyerSkuCode = $product['buyer_sku_code'] ?? null;
    $productName = $product['product_name'] ?? null;
    
    if (empty($buyerSkuCode) || empty($productName)) {
        continue; // Skip kalau data penting kosong
    }
    
    // Generate slug dengan null safety
    $slug = Str::slug(($product['brand'] ?? '') . ' ' . $productName);
    
    Produk::updateOrCreate(
        ['buyer_sku_code' => $buyerSkuCode], // INI SUDAH BENAR
        [
            "product_name" => $productName,
            "slug" => $slug ?: 'product-' . $buyerSkuCode,
            "category" => $product['category'] ?? '',
            "brand" => $product['brand'] ?? '',
            "type" => $product['type'] ?? '',
            "seller_name" => $product['seller_name'] ?? '',
            "selling_price" => $product['price'] ?? 0,
            "price" => $product['price'] ?? 0,
            "buyer_product_status" => $product['buyer_product_status'] ?? '',
            "seller_product_status" => $product['seller_product_status'] ?? '',
            "unlimited_stock" => $product['unlimited_stock'] ?? false,
            "stock" => $product['stock'] ?? 0,
            "multi" => $product['multi'] ?? false,
            "start_cut_off" => $product['start_cut_off'] ?? '',
            "end_cut_off" => $product['end_cut_off'] ?? '',
            "desc" => $product['desc'] ?? '',
            "updated_at" => now(),
        ]
    );
}
        
        return response()->json($responseData);
    }
    
    return response()->json([
        'error' => 'Gagal mengambil data produk',
        'status' => $response->status(),
        'body' => $response->body()
    ], 500);
}

public function topup($orderId)
{
    $refId = $orderId;
    $order = Transaction::where('order_id', $orderId)->first();
    $signature = md5(env('DIGIFLAZZ_USERNAME') . env('DIGIFLAZZ_PROD_KEY') . $refId);

    $response = Http::post('https://api.digiflazz.com/v1/transaction', [
        "username" => env('DIGIFLAZZ_USERNAME'),
        "buyer_sku_code" => $order->buyer_sku_code,
        // "customer_no" => $order->customer_no,
        // "buyer_sku_code" => 'ML600',
        "customer_no" => '136998338815636',
        "ref_id" => $refId,
        "testing" => false,
        "sign" => $signature,
    ]);    
    
    return $response->body();
    

    // $signature = md5(env('DIGIFLAZZ_USERNAME') . env('DIGIFLAZZ_DEV_KEY') . $order->order_id);

    // $response = Http::post('https://api.digiflazz.com/v1/transaction', [
    //     "username" => env('DIGIFLAZZ_USERNAME'),
    //     "buyer_sku_code" => $order->buyer_sku_code,
    //     "customer_no" => $order->customer_no,
    //     "ref_id" => $order->order_id,
    //     "testing" => true,
    //     "sign" => $signature,
    // ]);
    // return $response->body();

    // return response()->json($response->json());
}
    
public function handleDigiflazz(Request $request)
    {
        // 1. Ambil payload dan signature
        $payload = $request->getContent();
        $signatureHeader = $request->header('X-Hub-Signature');
        if (!$signatureHeader) {
            return response()->json(['error' => 'Unauthorized - Signature missing'], 401);
        }

        // 2. Verifikasi signature
        $secret = env('DIGIFLAZZ_WEBHOOK_SECRET');
        $expectedSignature = 'sha1=' . hash_hmac('sha1', $payload, $secret);
        if (!hash_equals($expectedSignature, $signatureHeader)) {
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        // 3. Decode payload
        $data = json_decode($payload, true);
        if (!isset($data['data']['ref_id'])) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        Log::info('Webhook DigiFlazz diterima:', $data);

        $trxData = $data['data'];
        $refId = $trxData['ref_id'];
        $status = $trxData['status'];
        $message = $trxData['message'] ?? '';
        $sku = $trxData['buyer_sku_code'];
        $sn = $trxData['sn'] ?? null;

        // 4. Update transaksi
        $transaksi = Transaction::where('order_id', $refId)->first();
        if (!$transaksi) {
            return response()->json(['error' => 'Transaksi tidak ditemukan'], 404);
        }

        $transaksi->digiflazz_status = $status;
        // $transaksi->keterangan = $message;

        // Simpan SN jika tersedia
        if ($status === 'Sukses' && $sn) {
            $transaksi->serial_number = $sn;
        }

        $transaksi->save();
        
        // 5. Kirim notifikasi WA jika tersedia
        if ($transaksi->wa_pembeli) {
            // $this->kirimWA($transaksi->wa, "Status transaksi: *$status*\nRef: $refId\nSKU: $sku\nPesan: $message");
            $this->WaSend($transaksi);
        }

        return response()->json(['success' => true]);
    }    

    protected function WaSend($transaksi)
    {        
        $template = "✅ Transaksi Berhasil!

Hai, pesanan Anda telah berhasil.

🧾 Produk : {$transaksi['product_name']}
💳 Nominal : Rp " . number_format($transaksi['gross_amount'], 0, ',', '.') . "
📱 Nomor Tujuan : {$transaksi['wa_pembeli']}
🕒 Waktu : {$transaksi['updated_at']}

Terima kasih telah menggunakan layanan kami! 😊";

    $response = Http::withHeaders([
        'Authorization' => env('FONNTE_TOKEN')
    ])->post('https://api.fonnte.com/send', [
        'target' => $transaksi['wa_pembeli'], // contoh: 6281234567890
        'message' => $template,
    ]);

    return $response->json();
    }
}
