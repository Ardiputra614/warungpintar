<?php

namespace App\Http\Controllers;

use App\Models\GamesCategory;
use App\Models\Kategori;
use App\Models\PlnCategory;
use App\Models\Provider;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class KategoriController extends Controller
{
    /**
     * Display a listing of the resource.
     */

     public function getTagihan()
    {
        $p = Tagihan::get();
        return response()->json($p);
    }

    public function getGames()
    {
        // Jika data ada dalam cache, itu akan digunakan. Jika tidak, data akan diambil dan disimpan dalam cache selama 10 menit
        $data = Cache::remember('key_data', 600, function () {
            return GamesCategory::all(); // Ambil data dari database atau proses lain
        });

        return response()->json($data);
    }

     public function getProvider() 
     {
        $p = Provider::get();
        return response()->json($p);
     }
    
    
}
