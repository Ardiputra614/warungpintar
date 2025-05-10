<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $data = PaymentMethod::create([
            "name" => $request->name,
            "nominal_fee" => $request->nominal_fee,
            "percentase_fee" => $request->percentase_fee,
            "type" => $request->type,
            "status" => $request->status,
            "logo" => $request->logo ?? null,
        ]);

        return response()->json($data);
    }

    public function update(PaymentMethod $payment_method, Request $request)
    {

        $data = $payment_method->update([
            "name" => $request->name,
            "nominal_fee" => $request->nominal_fee,
            "percentase_fee" => $request->percentase_fee,
            "type" => $request->type,
            "status" => $request->status,
            "logo" => $request->logo ?? null,
        ]);
        return response()->json($data);
    }

    public function destroy(PaymentMethod $payment_method)
    {
        $data = $payment_method->delete();
        return response()->json($data);
    }

}
