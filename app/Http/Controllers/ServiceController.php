<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            'title' => 'Layanan',
            'categories' => Category::get(),
        ]);
    }

    public function data(Request $request)
    {
        $query = Service::query()->with('category');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('slug', 'like', "%$s%")
                  ->orWhereHas('category', function ($categoryQuery) use ($s) {
                      $categoryQuery->where('name', 'like', "%$s%");
                  });
            });
        }

        return response()->json(
            $query->orderBy('id', 'desc')->paginate(50)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'customer_no_format' => 'required|in:satu_input,dua_input',
            'field1_label' => 'required|string',
            'field1_placeholder' => 'required|string',
            'field2_label' => 'nullable|string',
            'field2_placeholder' => 'nullable|string',
            'description' => 'nullable|string',
            'how_to_topup' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'icon' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        // Generate slug from name
        $data['slug'] = $this->generateUniqueSlug($data['name']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('services/logo', 'public');
        }

        // Handle icon upload
        if ($request->hasFile('icon')) {
            $data['icon'] = $request->file('icon')->store('services/icon', 'public');
        }

        $service = Service::create($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Service berhasil ditambahkan',
            'data' => $service->load('category')
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service)
    {
        // Validasi data
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'customer_no_format' => 'sometimes|in:satu_input,dua_input',
            'field1_label' => 'sometimes|required|string',
            'field1_placeholder' => 'sometimes|required|string',
            'field2_label' => 'nullable|string',
            'field2_placeholder' => 'nullable|string',
            'description' => 'nullable|string',
            'how_to_topup' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'is_popular' => 'sometimes|boolean',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'icon' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'remove_logo' => 'sometimes|boolean',
            'remove_icon' => 'sometimes|boolean',
        ]);

        // LOGIC SLUG: Hanya update jika nama berubah
        if ($request->has('name') && $request->name !== $service->name) {
            $data['slug'] = $this->generateUniqueSlug($request->name, $service->id);
        }

        // **PERBAIKAN DISINI**: Handle logo upload/removal dengan benar
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($service->logo && Storage::disk('public')->exists($service->logo)) {
                Storage::disk('public')->delete($service->logo);
            }
            
            // Store new logo
            $data['logo'] = $request->file('logo')->store('services/logo', 'public');
            
        } elseif ($request->has('remove_logo') && $request->boolean('remove_logo')) {
            
            if ($service->logo && Storage::disk('public')->exists($service->logo)) {
                Storage::disk('public')->delete($service->logo);
            }
            $data['logo'] = null; // Pastikan di-set null di database
        }
        // Jika tidak ada file logo dan tidak ada remove_logo flag, biarkan logo tetap

        // **PERBAIKAN DISINI**: Handle icon upload/removal dengan benar
        if ($request->hasFile('icon')) {
            // Delete old icon if exists
            if ($service->icon && Storage::disk('public')->exists($service->icon)) {
                Storage::disk('public')->delete($service->icon);
            }
            
            // Store new icon
            $data['icon'] = $request->file('icon')->store('services/icon', 'public');
            
        } elseif ($request->has('remove_icon') && $request->boolean('remove_icon')) {
            
            if ($service->icon && Storage::disk('public')->exists($service->icon)) {
                Storage::disk('public')->delete($service->icon);
            }
            $data['icon'] = null; // Pastikan di-set null di database
        }

        // Update service
        $service->update($data);
        
        // Reload fresh data with category
        $service->refresh()->load('category');
        
        
        return response()->json([
            'success' => true,
            'message' => 'Service berhasil diperbarui',
            'data' => $service
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        try {
            // Delete logo file if exists
            if ($service->logo && Storage::disk('public')->exists($service->logo)) {
                Storage::disk('public')->delete($service->logo);
            }
            
            // Delete icon file if exists
            if ($service->icon && Storage::disk('public')->exists($service->icon)) {
                Storage::disk('public')->delete($service->icon);
            }
            
            $service->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Service berhasil dihapus'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus service: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique slug
     */
    private function generateUniqueSlug($name, $excludeId = null)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        
        $counter = 1;
        while (Service::when($excludeId, function ($query) use ($excludeId) {
                return $query->where('id', '!=', $excludeId);
            })
            ->where('slug', $slug)
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
}