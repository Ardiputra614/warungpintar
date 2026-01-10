<?php

namespace App\Http\Controllers;

use App\Models\ProfilAplikasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfilAplikasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/ProfilAplikasi/Index', [
            'title' => 'PROFIL APLIKASI',
            'profil' => ProfilAplikasi::first(),
        ]);
    }

    public function data()
    {
        $profil = ProfilAplikasi::first();
        return response()->json($profil);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ProfilAplikasi $profilAplikasi)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProfilAplikasi $profilAplikasi)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProfilAplikasi $profilAplikasi)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProfilAplikasi $profilAplikasi)
    {
        //
    }
}
