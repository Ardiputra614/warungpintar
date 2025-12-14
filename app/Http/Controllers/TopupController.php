<?php

namespace App\Http\Controllers;

use App\Models\GamesCategory;
use App\Models\PaymentMethod;
use App\Models\Produk;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TopupController extends Controller
{   

    public function Topup($slug)
    {
        $game = GamesCategory::where('slug', $slug)->first();
        
        // Ambil semua produk dengan slug yang cocok
        $products = Produk::where(['slug' => $slug, 'buyer_product_status' => true, 'seller_product_status' => true])
        ->orderByRaw('CAST(selling_price AS DECIMAL(12,2)) ASC')
        ->get();        
        
        $paymentMethods = PaymentMethod::where('status', true)->get();
        
        // Get format configuration based on game's customer_no_format
        $formatConfig = $this->getFormatConfig($game->customer_no_format);
        
        
        return Inertia::render('Topup/GamesTopup', [
            'game' => $game,
            'products' => $products, // Semua produk (untuk kompatibilitas)            
            'payment' => $paymentMethods,
            'appUrl' => config('app.url'),
            'formatConfig' => $formatConfig,            
            'exampleFormat' => $game->example_format ?? $this->getDefaultExample($game->customer_no_format)
        ]);
    }

private function getFormatConfig($format)
{
    $configs = [
        'satu_input' => [
            'type' => 'single',
            'fields' => [
                ['key' => 'user_id', 'label' => 'User ID', 'placeholder' => 'Masukkan User ID']
            ],
            'description' => 'Masukkan User ID game Anda',
            'separator' => null,
        ],        
        'dua_input' => [
            'type' => 'combined',
            'fields' => [
                ['key' => 'user_id', 'label' => 'User ID', 'placeholder' => 'User ID'],
                ['key' => 'server_id', 'label' => 'Server ID', 'placeholder' => 'Server ID']
            ],
            'description' => 'Masukkan User ID dan Server ID dipisah dengan tanda +',
            'separator' => '+',
        ],        
    ];
    
    return $configs[$format] ?? $configs['user_id'];
}

private function getDefaultExample($format)
{
    $examples = [
        'satu_input' => '123456789',
        'dua_input' => '123456789+1234',        
    ];
    
    return $examples[$format] ?? '123456789';
}

    public function ProviderTopup($slug, $category)
    {                
        return Inertia::render('Topup/ProviderTopup', [
            'products' => Produk::where(['slug' => $slug, 'category' => $category])->get(),
            'payment' => PaymentMethod::where('status', 'on')->get(),
            'appUrl' => env('APP_URL'),
        ]);
    }

    public function produkwithbrand($brand)
    {        
        $data = Produk::where('brand', $brand)->orderByRaw('CAST(selling_price AS UNSIGNED) asc')->get();
        return response()->json($data);
    }
        
    public function inquiryPln($customer_no)
{
    $username = env('DIGIFLAZZ_USERNAME');
    $prodKey = env('DIGIFLAZZ_PROD_KEY');
    
    // Validasi sederhana
    if (empty($customer_no) || !is_numeric($customer_no)) {
        return [
            'success' => false,
            'message' => 'Nomor pelanggan tidak valid',
            'data' => null
        ];
    }
    
    $signature = md5($username . $prodKey . $customer_no);
    
    try {
        $response = Http::post('https://api.digiflazz.com/v1/inquiry-pln', [
            "username" => $username,
            "customer_no" => $customer_no,
            "sign" => $signature,
        ]);
        
        $responseData = $response->json();
        
        // Cek response code
        $rc = $responseData['data']['rc'] ?? null;
        
        if ($rc == '00') {
            Log::info("✅ Inquiry PLN berhasil: {$customer_no}");
            
            return [
                'success' => true,
                'message' => 'Inquiry berhasil',
                'data' => $responseData['data']
            ];
        } else {
            $message = $responseData['data']['message'] ?? 'Inquiry gagal';
            Log::warning("❌ Inquiry PLN gagal: {$customer_no} - {$message}");
            
            return [
                'success' => false,
                'message' => $message,
                'data' => $responseData['data'] ?? null
            ];
        }
        
    } catch (\Exception $e) {
        Log::error('Error PLN inquiry: ' . $e->getMessage());
        
        return [
            'success' => false,
            'message' => 'Terjadi kesalahan sistem',
            'data' => null
        ];
    }
}
    
    

}