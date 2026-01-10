<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/Service/Index', [
            'title' => 'Layanan'
        ]);
    }

    public function data(Request $request)
    {
        $query = Service::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                ->orWhere('category', 'like', "%$s%")
                ->orWhere('slug', 'like', "%$s%");
            });
        }

        return response()->json(
            $query->orderBy('id', 'desc')->limit(50)->get()
        );
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
    $data = $request->validate([
        'name' => 'required',
        'slug' => 'required|unique:services',
        'category' => 'required',
        'customer_no_format' => 'required|in:satu_input,dua_input',
        'field1_label' => 'required',
        'field1_placeholder' => 'required',
        'field2_label' => 'nullable',
        'field2_placeholder' => 'nullable',
        'description' => 'nullable',
        'how_to_topup' => 'nullable',
        'notes' => 'nullable',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'logo' => 'nullable|image',
        'icon' => 'nullable|image',
    ]);

    if ($request->hasFile('logo')) {
        $data['logo'] = $request->file('logo')->store('services/logo', 'public');
    }

    if ($request->hasFile('icon')) {
        $data['icon'] = $request->file('icon')->store('services/icon', 'public');
    }

    Service::create($data);
}


    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Service $service)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service)
{
    $data = $request->validate([
        'name' => 'required',
        'slug' => 'required|unique:services,slug,' . $service->id,
        'category' => 'required',
        'customer_no_format' => 'required|in:satu_input,dua_input',
        'field1_label' => 'required',
        'field1_placeholder' => 'required',
        'field2_label' => 'nullable',
        'field2_placeholder' => 'nullable',
        'description' => 'nullable',
        'how_to_topup' => 'nullable',
        'notes' => 'nullable',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'logo' => 'nullable|image',
        'icon' => 'nullable|image',
    ]);

    if ($request->hasFile('logo')) {
        $data['logo'] = $request->file('logo')->store('services/logo', 'public');
    }

    if ($request->hasFile('icon')) {
        $data['icon'] = $request->file('icon')->store('services/icon', 'public');
    }

    $service->update($data);
}



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        $data = $service->delete();
        return response()->json($data);
    }
}
