<?php

namespace App\Http\Controllers;

use App\Models\GamesCategory;
use App\Models\Provider;
use App\Models\Tagihan;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home/Index', [
            'title' => 'Warung Pintar',
            'games' =>  GamesCategory::all(),
            // 'provider' => Provider::all(),
            // 'tagihan' => Tagihan::all(),            
        ]);
    }

    public function games()
    {
        return Inertia::render('Home/Games', [
            'title' => 'Warung Pintar'
        ]);
    }

    public function history($orderId)
{
    // Validasi format orderId
    if (!preg_match('/^[a-zA-Z0-9-_]+$/', $orderId)) {
        return Inertia::render('Home/History', [
            'title' => 'Transaksi Tidak Ditemukan | ARFENAZ MVA',
            'data' => null,
            'error' => 'Format ID transaksi tidak valid',
            'orderId' => $orderId,
        ]);
    }
    
    // Cari transaksi
    $data = Transaction::where('order_id', $orderId)->first();
    
    // Jika tidak ditemukan
    if (!$data) {
        // Coba cari dengan berbagai format (case insensitive, tanpa spasi, dll)
        $data = Transaction::where('order_id', 'like', '%' . $orderId . '%')
                          ->orWhere('id', $orderId)
                          ->orWhere('customer_no', $orderId)
                          ->first();
        
        if (!$data) {
            return Inertia::render('Home/History', [
                'title' => 'Transaksi Tidak Ditemukan | ARFENAZ MVA',
                'data' => null,
                'error' => 'Transaksi tidak ditemukan',
                'orderId' => $orderId,
                'suggestions' => $this->getSimilarTransactions($orderId),
            ]);
        }
    }
    
    // Cek status transaksi
    if ($data->transaction_status === 'expired') {
        return Inertia::render('Home/History', [
            'title' => 'Transaksi Kedaluwarsa | ARFENAZ MVA',
            'data' => $data,
            'warning' => 'Transaksi ini telah kedaluwarsa',
        ]);
    }
    
    return Inertia::render('Home/History', [
        'title' => 'Detail Transaksi | ARFENAZ MVA',
        'data' => $data,
        'orderId' => $orderId,
    ]);
}

// Helper function untuk mencari transaksi serupa
private function getSimilarTransactions($orderId)
{
    // Ambil 5 transaksi terbaru sebagai saran
    return Transaction::query()
        ->where('order_id', '!=', $orderId)
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get(['order_id', 'product_name', 'created_at'])
        ->map(function ($transaction) {
            return [
                'order_id' => $transaction->order_id,
                'product' => $transaction->product_name,
                'date' => $transaction->created_at->format('d M Y H:i'),
            ];
        });
}
}
