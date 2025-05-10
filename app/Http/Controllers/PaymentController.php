<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    private $apiKey;
    private $merchantCode;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('tripay.api_key');
        $this->merchantCode = config('tripay.merchant_code');
        $this->baseUrl = config('tripay.base_url');
    }

    public function getPaymentChannels()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey
        ])->get($this->baseUrl . '/merchant/payment-channel');

        return response()->json($response->json());
    }

    public function createTransaction(Request $request)
    {
        $request->validate([
            'type' => 'required|in:PPOB,GAME',
            'service' => 'required',
            'product_code' => 'required',
            'amount' => 'required|numeric',
            'payment_method' => 'required'
        ]);

        // Create transaction in database
        $transaction = Transaction::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'service' => $request->service,
            'product_code' => $request->product_code,
            'amount' => $request->amount,
            'price' => $request->price,
            'reference' => 'TRX' . time(),
            'status' => 'PENDING',
            'payment_method' => $request->payment_method,
            'payment_status' => 'UNPAID'
        ]);

        // Create payment in Tripay
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey
        ])->post($this->baseUrl . '/transaction/create', [
            'method' => $request->payment_method,
            'merchant_ref' => $transaction->reference,
            'amount' => $request->price,
            'customer_name' => auth()->user()->name,
            'customer_email' => auth()->user()->email,
            'order_items' => [
                [
                    'name' => $request->service,
                    'price' => $request->price,
                    'quantity' => 1
                ]
            ],
            'return_url' => route('payment.success'),
            'expired_time' => (time() + (24 * 60 * 60)), // 24 jam
            'signature' => hash_hmac('sha256', $this->merchantCode . $transaction->reference . $request->price, $this->apiKey)
        ]);

        $paymentData = $response->json();

        // Update transaction with payment reference
        $transaction->update([
            'payment_reference' => $paymentData['reference'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $paymentData
        ]);
    }

    public function callback(Request $request)
    {
        $callbackSignature = $request->header('X-Callback-Signature');
        $json = $request->getContent();

        $signature = hash_hmac('sha256', $json, $this->apiKey);

        if ($callbackSignature !== $signature) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid signature'
            ], 400);
        }

        $data = json_decode($json);

        $transaction = Transaction::where('payment_reference', $data->reference)->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        if ($data->status === 'PAID') {
            $transaction->update([
                'payment_status' => 'PAID',
                'status' => 'PROCESSING'
            ]);

            // Process the order based on transaction type
            if ($transaction->type === 'PPOB') {
                $this->processPPOBOrder($transaction);
            } else if ($transaction->type === 'GAME') {
                $this->processGameOrder($transaction);
            }
        }

        return response()->json(['success' => true]);
    }

    private function processPPOBOrder($transaction)
    {
        // Implement PPOB processing logic here
        // This could involve calling a PPOB provider's API
        $response = Http::withHeaders([
            'Authorization' => 'Your-PPOB-API-Key'
        ])->post('ppob-provider-url', [
            'service' => $transaction->service,
            'product_code' => $transaction->product_code,
            'amount' => $transaction->amount
        ]);

        if ($response->successful()) {
            $transaction->update(['status' => 'SUCCESS']);
        } else {
            $transaction->update(['status' => 'FAILED']);
        }
    }

    private function processGameOrder($transaction)
    {
        // Implement game top-up processing logic here
        // This could involve calling a game top-up provider's API
        $response = Http::withHeaders([
            'Authorization' => 'Your-Game-API-Key'
        ])->post('game-provider-url', [
            'game' => $transaction->service,
            'product_code' => $transaction->product_code,
            'amount' => $transaction->amount
        ]);

        if ($response->successful()) {
            $transaction->update(['status' => 'SUCCESS']);
        } else {
            $transaction->update(['status' => 'FAILED']);
        }
    }
}
