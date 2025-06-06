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
            'provider' => Provider::all(),
            'tagihan' => Tagihan::all(),            
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
        $data = Transaction::where('order_id', $orderId)->first();
        return Inertia::render('Home/History', [
            'title' => 'History transaksi | Warung Pintar',
            // 'data' => Cache::get('transkey_' . $orderId),
            'data' => $data,
        ]);
    }
}
