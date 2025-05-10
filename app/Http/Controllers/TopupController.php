<?php

namespace App\Http\Controllers;

use App\Models\GamesCategory;
use App\Models\PaymentMethod;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TopupController extends Controller
{
    public function GamesTopup($slug)
    {        
        return Inertia::render('Topup/GamesTopup', [
            'products' => Produk::where('slug', $slug)->orderByRaw('CAST(selling_price AS UNSIGNED) asc')->get(),
            'payment' => PaymentMethod::where('status', 'on')->get(),
            'appUrl' => env('APP_URL'),
            'game' => GamesCategory::where('slug', $slug)->first()
        ]);
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
return response()->json(data);
}
}
