<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function index() {
        return Inertia::render('Admin/Dashboard');
    }

    public function setting() {
        return Inertia::render('Admin/Setting');
    }    
}
