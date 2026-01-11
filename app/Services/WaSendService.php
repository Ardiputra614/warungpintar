<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;

class WaSendService
{
    private $waEngineUrl;
    
    public function __construct()
    {
        $this->waEngineUrl = env('WA_ENGINE_URL', 'http://localhost:3000');
    }
    
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
            "🕒 Waktu : {$transaction->updated_at->format('Y-m-d H:i:s')}\n\n" .
            "Terima kasih telah menggunakan layanan kami 🙏";

        // 1. Ambil daftar devices yang tersedia
        $availableDevice = $this->getAvailableDevice();
        
        if (!$availableDevice) {
            Log::error('Tidak ada device WA yang tersedia');
            return false;
        }

        // 2. Kirim pesan menggunakan device yang tersedia
        $response = Http::timeout(30)
            ->post($this->waEngineUrl . '/api/send-message', [
                'device_id' => $availableDevice['id'],
                'target' => $this->formatPhone($transaction->wa_pembeli),
                'message' => $template,
                'delay' => rand(4000, 10000) // Random delay
            ]);

        if ($response->successful()) {
            Log::info('WA berhasil dikirim', [
                'transaction_id' => $transaction->id,
                'device_id' => $availableDevice['id'],
                'phone' => $transaction->wa_pembeli
            ]);
            
            // Update transaction
            // $transaction->update([
            //     'wa_sent' => true,
            //     'wa_sent_at' => now(),
            //     'wa_device_id' => $availableDevice['id']
            // ]);
            
            return true;
        }

        Log::error('Gagal kirim WA', [
            'response' => $response->body(),
            'device_id' => $availableDevice['id']
        ]);
        
        return false;
    }
    
    /**
     * Ambil device yang tersedia (connected)
     * Pilih random dari yang tersedia
     */
    private function getAvailableDevice(): ?array
    {
        try {
            $response = Http::timeout(5)
                ->get($this->waEngineUrl . '/api/devices');
            
            if ($response->successful()) {
                $devices = $response->json()['devices'] ?? [];
                
                // Filter hanya yang connected
                $connectedDevices = array_filter($devices, function($device) {
                    return $device['status'] === 'connected';
                });
                
                if (empty($connectedDevices)) {
                    Log::warning('Tidak ada device yang connected');
                    return null;
                }
                
                // Pilih random device
                $selected = $connectedDevices[array_rand($connectedDevices)];
                
                Log::debug('Selected device', [
                    'device_id' => $selected['id'],
                    'total_available' => count($connectedDevices)
                ]);
                
                return $selected;
            }
            
            Log::error('Gagal mengambil daftar devices', [
                'status' => $response->status()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error saat ambil devices: ' . $e->getMessage());
        }
        
        return null;
    }
    
    /**
     * Format nomor telepon
     */
    private function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        if (str_starts_with($phone, '08')) {
            return '62' . substr($phone, 1);
        }
        
        if (!str_starts_with($phone, '62')) {
            return '62' . $phone;
        }
        
        return $phone;
    }
    
    /**
     * Method tambahan untuk testing
     */
    public function testSend(string $phone, string $message): array
    {
        $availableDevice = $this->getAvailableDevice();
        
        if (!$availableDevice) {
            return ['success' => false, 'error' => 'No available devices'];
        }
        
        try {
            $response = Http::timeout(30)
                ->post($this->waEngineUrl . '/api/send-message', [
                    'device_id' => $availableDevice['id'],
                    'target' => $this->formatPhone($phone),
                    'message' => $message
                ]);
            
            return [
                'success' => $response->successful(),
                'device_id' => $availableDevice['id'],
                'response' => $response->json()
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Cek status server WA Engine
     */
    public function checkStatus(): array
    {
        try {
            $response = Http::timeout(5)
                ->get($this->waEngineUrl . '/health');
            
            return [
                'connected' => $response->successful(),
                'status' => $response->status(),
                'data' => $response->json()
            ];
            
        } catch (\Exception $e) {
            return [
                'connected' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}