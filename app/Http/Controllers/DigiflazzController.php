<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\ProdukPasca;
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
    // $slug = Str::slug($product['brand']);
    
    Produk::updateOrCreate(
        ['buyer_sku_code' => $buyerSkuCode], // INI SUDAH BENAR
        [
            "product_name" => $productName,
            "slug" => Str::lower(Str::slug($product['brand'])),
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

public function getProductsPasca(Request $request)
{
    $header = ['Content-Type' => 'application/json'];
    $apiUrl = "https://api.digiflazz.com/v1/price-list";
    $apiKey = env('DIGIFLAZZ_PROD_KEY');
    $username = env('DIGIFLAZZ_USERNAME');

    $data = [
        'cmd' => 'pasca',
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
    // $slug = Str::slug($product['brand']);
    
    ProdukPasca::updateOrCreate(
        ['buyer_sku_code' => $buyerSkuCode], // INI SUDAH BENAR
        [
            "product_name" => $productName,
            "slug" => Str::lower(Str::slug($product['brand'])),
            "category" => $product['category'] ?? '',
            "brand" => $product['brand'] ?? '',            
            "seller_name" => $product['seller_name'] ?? '',
            "selling_price" => $product['price'] ?? 0,
            "price" => $product['price'] ?? 0,
            "buyer_product_status" => $product['buyer_product_status'] ?? '',
            "seller_product_status" => $product['seller_product_status'] ?? '',            
            "start_cut_off" => $product['start_cut_off'] ?? '',
            "end_cut_off" => $product['end_cut_off'] ?? '',
            "admin" => $product['admin'] ?? 0,
            "commission" => $product['commission'] ?? 0,
            "desc" => $product['desc'] ?? '',
            "updated_at" => now(),
        ]
    );
}
        
        return response()->json($responseData);
        Log::info($responseData);
    }
    
    return response()->json([
        'error' => 'Gagal mengambil data produk',
        'status' => $response->status(),
        'body' => $response->body()
    ], 500);
}
    
public function handleDigiflazz(Request $request)
{
    try {
        // 1. Ambil payload dan signature
        $payload = $request->getContent();
        $signatureHeader = $request->header('X-Hub-Signature');
        
        if (!$signatureHeader) {
            Log::warning('DigiFlazz Webhook: Signature missing', ['ip' => $request->ip()]);
            return response()->json(['error' => 'Unauthorized - Signature missing'], 401);
        }

        // 2. Verifikasi signature
        $secret = env('DIGIFLAZZ_WEBHOOK_SECRET');
        $expectedSignature = 'sha1=' . hash_hmac('sha1', $payload, $secret);
        
        if (!hash_equals($expectedSignature, $signatureHeader)) {
            Log::warning('DigiFlazz Webhook: Invalid signature', [
                'expected' => $expectedSignature,
                'received' => $signatureHeader
            ]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        // 3. Decode payload
        $data = json_decode($payload, true);
        
        if (!isset($data['data']['ref_id'])) {
            Log::error('DigiFlazz Webhook: Invalid payload structure', $data);
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        Log::info('Webhook DigiFlazz diterima:', $data);

        $trxData = $data['data'];
        $refId = $trxData['ref_id'];
        $status = $trxData['status'];
        $message = $trxData['message'] ?? '';
        $sku = $trxData['buyer_sku_code'] ?? null;
        $sn = $trxData['sn'] ?? null;

        // 4. Update transaksi
        $transaksi = Transaction::where('order_id', $refId)->first();
        
        if (!$transaksi) {
            // Coba cari berdasarkan ref_id juga
            $transaksi = Transaction::where('ref_id', $refId)->first();
            
            if (!$transaksi) {
                Log::error('DigiFlazz Webhook: Transaksi tidak ditemukan', [
                    'ref_id' => $refId,
                    'data' => $trxData
                ]);
                return response()->json(['error' => 'Transaksi tidak ditemukan'], 404);
            }
        }

        // 5. Update data berdasarkan tipe produk
        $this->updateTransactionData($transaksi, $trxData, $status, $data);

        // 6. Kirim notifikasi
        if ($transaksi->wa_pembeli) {
            $this->sendWhatsAppNotification($transaksi, $status, $message);
        }

        return response()->json(['success' => true, 'message' => 'Webhook processed']);
        
    } catch (\Exception $e) {
        Log::error('Error processing DigiFlazz webhook:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['error' => 'Internal server error'], 500);
    }
}

/**
 * Update transaction data based on product type
 */
private function updateTransactionData($transaction, $trxData, $status, $fullData)
{
    // Update basic status
    $transaction->digiflazz_status = $status;
    $transaction->digiflazz_callback = $fullData;
    
    // Simpan serial number untuk produk yang memiliki SN
    if ($status === 'Sukses' && isset($trxData['sn'])) {
        $transaction->serial_number = $trxData['sn'];
    }

    // Handle berdasarkan tipe produk
    $productType = $this->determineProductType($trxData['buyer_sku_code'] ?? '');
    $transaction->product_type = $productType;
    
    switch ($productType) {
        case 'pulsa':
        case 'data':
            $transaction->voucher_code = $trxData['sn'] ?? null;
            break;
            
        case 'pln':
            // Token PLN
            if (isset($trxData['token'])) {
                $transaction->serial_number = $trxData['token'];
            }
            // Data pelanggan PLN
            if (isset($trxData['customer_name'])) {
                $transaction->customer_name = $trxData['customer_name'];
            }
            if (isset($trxData['meter_no'])) {
                $transaction->meter_no = $trxData['meter_no'];
            }
            if (isset($trxData['kwh'])) {
                $transaction->kwh = $trxData['kwh'];
            }
            break;
            
        case 'pdam':
            // PDAM
            if (isset($trxData['customer_name'])) {
                $transaction->customer_name = $trxData['customer_name'];
            }
            if (isset($trxData['period'])) {
                $transaction->note = 'Periode: ' . $trxData['period'];
            }
            break;
            
        case 'game':
            // Voucher game
            $transaction->subscriber_id = $trxData['customer_no'] ?? null;
            $transaction->voucher_code = $trxData['sn'] ?? null;
            break;
            
        case 'emoney':
            // E-money
            if (isset($trxData['sn'])) {
                $transaction->serial_number = $trxData['sn'];
            }
            break;
            
        case 'streaming':
            // Streaming subscription
            $transaction->subscriber_id = $trxData['customer_no'] ?? null;
            $transaction->voucher_code = $trxData['sn'] ?? null;
            break;
    }
    
    // Simpan balance info jika ada
    if (isset($fullData['data']['balance'])) {
        $transaction->note = ($transaction->note ? $transaction->note . ' | ' : '') . 
                            'Balance: ' . $fullData['data']['balance'];
    }
    
    // Update price jika ada
    if (isset($trxData['price'])) {
        $transaction->purchase_price = $trxData['price'];
    }
    
    $transaction->save();
    
    // Log perubahan
    Log::info('Transaction updated via webhook:', [
        'order_id' => $transaction->order_id,
        'status' => $status,
        'product_type' => $productType
    ]);
}

/**
 * Determine product type from SKU
 */
private function determineProductType($sku)
{
    // Ini contoh sederhana, sesuaikan dengan katalog produk Anda
    if (str_starts_with($sku, 'PLN')) return 'pln';
    if (str_starts_with($sku, 'PDAM')) return 'pdam';
    if (str_starts_with($sku, 'GAME')) return 'game';
    if (str_starts_with($sku, 'PULSA')) return 'pulsa';
    if (str_starts_with($sku, 'DATA')) return 'data';
    if (str_starts_with($sku, 'EMONEY')) return 'emoney';
    if (str_starts_with($sku, 'TV')) return 'streaming';
    
    return 'other';
}

/**
 * Send WhatsApp notification
 */
private function sendWhatsAppNotification($transaction, $status, $message)
{
    try {
        $statusText = $this->getStatusText($status);
        $productInfo = $this->getProductInfo($transaction);
        
        $message = "🔔 *NOTIFIKASI TRANSAKSI*\n\n" .
                  "📦 Produk: *{$productInfo}*\n" .
                  "📱 No Pelanggan: *{$transaction->customer_no}*\n" .
                  "💰 Harga: Rp " . number_format($transaction->selling_price, 0, ',', '.') . "\n" .
                  "📋 Status: *{$statusText}*\n" .
                  "🆔 Ref ID: {$transaction->ref_id}\n";
        
        if ($transaction->serial_number) {
            $message .= "🔑 Serial/Token: *{$transaction->serial_number}*\n";
        }
        
        if ($message) {
            $message .= "📝 Pesan: {$message}\n";
        }
        
        // Kirim via WhatsApp API
        $this->sendWA($transaction->wa_pembeli, $message);
        
    } catch (\Exception $e) {
        Log::error('Failed to send WhatsApp notification:', [
            'error' => $e->getMessage(),
            'transaction_id' => $transaction->id
        ]);
    }
}

private function getStatusText($status)
{
    $statusMap = [
        'Sukses' => '✅ BERHASIL',
        'Gagal' => '❌ GAGAL',
        'Pending' => '⏳ MENUNGGU',
        'Processing' => '🔄 PROSES'
    ];
    
    return $statusMap[$status] ?? $status;
}

private function getProductInfo($transaction)
{
    if ($transaction->product_name) {
        return $transaction->product_name;
    }
    
    return $transaction->buyer_sku_code;
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
