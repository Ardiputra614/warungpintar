<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PaymentMethodController extends Controller
{
    public function paymentmethodon()
    {
        $data = PaymentMethod::where('status', 'on')->get();
        return response()->json($data);
    }
    
    public function index()
    {
        return Inertia::render('Admin/PaymentMethod/Index', [
            'title' => 'Metode Pembayaran',
            'paymentMethod' => PaymentMethod::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nominal_fee' => 'required|numeric',
            'percentase_fee' => 'required|numeric',
            'type' => 'required|string',
            'status' => 'required|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,gif,svg|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $fileName = 'logo_' . Str::random(20) . '.' . $file->getClientOriginalExtension();
            $logoPath = $file->storeAs('payment-methods', $fileName, 'public');
            $validated['logo'] = Storage::url($logoPath);
        } else {
            // Jika tidak ada file, jangan set logo di validated
            unset($validated['logo']);
        }

        $data = PaymentMethod::create($validated);

        return response()->json($data, 201);
    }

    public function update(Request $request, $id)
    {
        // Cari payment method
        $paymentMethod = PaymentMethod::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nominal_fee' => 'required|numeric',
            'percentase_fee' => 'required|numeric',
            'type' => 'required|string',
            'status' => 'required|string',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,gif,svg|max:2048',
        ]);

        // Jika ada file logo baru yang diupload
        if ($request->hasFile('logo')) {
            // Hapus logo lama jika ada
            if ($paymentMethod->logo) {
                $oldPath = str_replace('/storage/', '', $paymentMethod->logo);
                Storage::disk('public')->delete($oldPath);
            }
            
            // Simpan logo baru
            $file = $request->file('logo');
            $fileName = 'logo_' . Str::random(20) . '.' . $file->getClientOriginalExtension();
            $logoPath = $file->storeAs('payment-methods', $fileName, 'public');
            $validated['logo'] = Storage::url($logoPath);
        } else {
            // Jika tidak ada file baru diupload, pertahankan logo yang lama
            unset($validated['logo']); // Hapus logo dari validated agar tidak diupdate
        }

        $paymentMethod->update($validated);

        return response()->json($paymentMethod->fresh());
    }

    public function destroy(PaymentMethod $payment_method)
    {
        // Hapus logo jika ada
        if ($payment_method->logo) {
            $oldPath = str_replace('/storage/', '', $payment_method->logo);
            Storage::disk('public')->delete($oldPath);
        }
        
        $payment_method->delete();
        return response()->json(['message' => 'Payment method deleted successfully']);
    }
}