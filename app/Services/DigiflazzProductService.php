<?php

namespace App\Services;

use App\Events\StatusProduct;
use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;


class DigiflazzProductService
{
    public function syncStatus()
    {
        try {
            Log::info('🔄 Starting Digiflazz sync...');
            
            $response = Http::timeout(30)->post('https://api.digiflazz.com/v1/price-list', [
                'cmd' => 'prepaid',
                'username' => env('DIGIFLAZZ_USERNAME'),
                'sign' => md5(
                    env('DIGIFLAZZ_USERNAME') .
                    env('DIGIFLAZZ_PROD_KEY') .
                    'pricelist'
                ),
            ]);

            // Debug: Lihat response mentah
            Log::debug('Digiflazz Response Status: ' . $response->status());
            Log::debug('Digiflazz Response Body: ' . $response->body());

            if (! $response->successful()) {
                Log::error('❌ Gagal ambil data produk Digiflazz. Status: ' . $response->status());
                return false;
            }

            $responseData = $response->json();
            
            // Debug: Lihat struktur response
            Log::debug('Response JSON structure:', $responseData);

            // Cek struktur response yang benar
            if (!isset($responseData['data']) || !is_array($responseData['data'])) {
                Log::error('❌ Struktur response Digiflazz tidak valid');
                Log::error('Response data:', $responseData);
                return false;
            }

            $products = $responseData['data'];
            $updatedCount = 0;
            $broadcastCount = 0;
            $errorCount = 0;

            Log::info('📊 Total produk dari Digiflazz: ' . count($products));

            foreach ($products as $index => $item) {
                try {
                    // Validasi item harus array
                    if (!is_array($item)) {
                        Log::warning("Item #{$index} bukan array: " . gettype($item));
                        continue;
                    }

                    // Debug: Lihat struktur item
                    if ($index === 0) {
                        Log::debug('Sample item structure:', $item);
                    }

                    // Cek field yang diperlukan
                    if (!isset($item['buyer_sku_code'])) {
                        Log::warning("Item #{$index} tidak memiliki buyer_sku_code");
                        continue;
                    }

                    $skuCode = $item['buyer_sku_code'];
                    
                    // Cek apakah produk ada di database
                    $produk = Product::where('buyer_sku_code', $skuCode)->first();

                    if (! $produk) {
                        Log::debug("Produk dengan SKU {$skuCode} tidak ditemukan di database");
                        continue;
                    }

                    // Validasi status dari Digiflazz
                    $digiflazzBuyerStatus = $this->normalizeStatus($item['buyer_product_status'] ?? null);
                    $digiflazzSellerStatus = $this->normalizeStatus($item['seller_product_status'] ?? null);

                    if ($digiflazzBuyerStatus === null || $digiflazzSellerStatus === null) {
                        Log::warning("Status tidak valid untuk SKU: {$skuCode}", [
                            'buyer' => $item['buyer_product_status'] ?? 'null',
                            'seller' => $item['seller_product_status'] ?? 'null',
                        ]);
                        continue;
                    }

                    // 🔔 Cek apakah status berubah
                    $buyerChanged = (bool)$produk->buyer_product_status !== $digiflazzBuyerStatus;
                    $sellerChanged = (bool)$produk->seller_product_status !== $digiflazzSellerStatus;
                    
                    if ($buyerChanged || $sellerChanged) {
                        Log::info('🔄 Status berubah untuk SKU: ' . $skuCode, [
                            'old_buyer' => $produk->buyer_product_status,
                            'new_buyer' => $digiflazzBuyerStatus,
                            'old_seller' => $produk->seller_product_status,
                            'new_seller' => $digiflazzSellerStatus,
                        ]);

                        // Update database
                        $produk->update([
                            'buyer_product_status' => $digiflazzBuyerStatus,
                            'seller_product_status' => $digiflazzSellerStatus,
                            'last_status_changed_at' => now(),
                        ]);

                        // Broadcast event
                        broadcast(new StatusProduct(
                            $produk->buyer_sku_code,
                            $digiflazzBuyerStatus,
                            $digiflazzSellerStatus
                        ));

                        $broadcastCount++;
                        Log::info('📢 Broadcast untuk SKU: ' . $produk->buyer_sku_code);
                    }
                    
                    $updatedCount++;
                    
                } catch (\Exception $e) {
                    $errorCount++;
                    Log::error("❌ Error processing item #{$index}: " . $e->getMessage(), [
                        'sku' => $item['buyer_sku_code'] ?? 'unknown',
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }

            Log::info('✅ Sync status produk Digiflazz selesai', [
                'total_products' => count($products),
                'processed' => $updatedCount,
                'broadcasted' => $broadcastCount,
                'errors' => $errorCount,
            ]);

            return true;
            
        } catch (\Exception $e) {
            Log::error('❌ Fatal error in Digiflazz sync: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
    
    /**
     * Normalize status value from Digiflazz
     */
    private function normalizeStatus($status)
    {
        if ($status === null) {
            return null;
        }

        // Jika status adalah boolean
        if (is_bool($status)) {
            return $status;
        }

        // Jika status adalah string
        if (is_string($status)) {
            $status = strtolower(trim($status));
            
            if ($status === 'true' || $status === '1' || $status === 'yes' || $status === 'aktif') {
                return true;
            }
            
            if ($status === 'false' || $status === '0' || $status === 'no' || $status === 'nonaktif') {
                return false;
            }
        }

        // Jika status adalah integer
        if (is_int($status)) {
            return $status === 1;
        }

        return null;
    }
    
    // Method untuk cek status tunggal (dengan error handling)
    public function checkSingleProduct($skuCode)
    {
        try {
            Log::info('🔍 Checking single product: ' . $skuCode);
            
            $response = Http::timeout(15)->post('https://api.digiflazz.com/v1/price-list', [
                'cmd' => 'prepaid',
                'username' => env('DIGIFLAZZ_USERNAME'),
                'sign' => md5(
                    env('DIGIFLAZZ_USERNAME') .
                    env('DIGIFLAZZ_PROD_KEY') .
                    'pricelist'
                ),
            ]);

            if (! $response->successful()) {
                Log::error('❌ Failed to fetch from Digiflazz');
                return null;
            }

            $responseData = $response->json();
            
            if (!isset($responseData['data']) || !is_array($responseData['data'])) {
                Log::error('❌ Invalid response structure');
                return null;
            }

            $products = $responseData['data'];
            
            foreach ($products as $item) {
                if (!is_array($item)) {
                    continue;
                }
                
                if (($item['buyer_sku_code'] ?? null) == $skuCode) {
                    return [
                        'buyer_sku_code' => $item['buyer_sku_code'] ?? null,
                        'buyer_product_status' => $this->normalizeStatus($item['buyer_product_status'] ?? null),
                        'seller_product_status' => $this->normalizeStatus($item['seller_product_status'] ?? null),
                        'product_name' => $item['product_name'] ?? null,
                        'category' => $item['category'] ?? null,
                        'brand' => $item['brand'] ?? null,
                    ];
                }
            }
            
            Log::warning('Product not found: ' . $skuCode);
            return null;
            
        } catch (\Exception $e) {
            Log::error('❌ Error checking single product: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Test connection to Digiflazz API
     */
    public function testConnection()
    {
        try {
            $startTime = microtime(true);
            
            $response = Http::timeout(10)->post('https://api.digiflazz.com/v1/price-list', [
                'cmd' => 'prepaid',
                'username' => env('DIGIFLAZZ_USERNAME'),
                'sign' => md5(
                    env('DIGIFLAZZ_USERNAME') .
                    env('DIGIFLAZZ_PROD_KEY') .
                    'pricelist'
                ),
            ]);
            
            $responseTime = round(microtime(true) - $startTime, 2);
            
            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message' => 'Connection successful',
                    'response_time' => $responseTime . 's',
                    'status_code' => $response->status(),
                    'total_products' => count($data['data'] ?? []),
                    'sample_product' => $data['data'][0] ?? null,
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Connection failed',
                    'response_time' => $responseTime . 's',
                    'status_code' => $response->status(),
                    'body' => $response->body(),
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Exception: ' . $e->getMessage(),
                'response_time' => round(microtime(true) - $startTime, 2) . 's',
            ];
        }
    }
}