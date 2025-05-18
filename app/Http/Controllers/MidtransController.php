<?php

namespace App\Http\Controllers;

use App\Jobs\DigiflazzTopup;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    public function createTransaction(Request $request)
    {                

        $paymentMethod = $request->input('paymentMethod'); // Atau ambil dari $request->input('payment_method');
        // $paymentMethod = 'qris'; // Atau ambil dari $request->input('payment_method');
        $grossAmount = $request->input('selling_price');
        $customerNo = $request->input('customer_no');

        $item_details = [
            ['id' => $request->input('id'), 'price' => $request->input('selling_price'), 'quantity' => 1, 'name' => $request->input('product_name')],
            // ['id' => 'item2', 'selling_price' => 10000, 'quantity' => 1, 'name' => 'Biaya Admin']
        ];

        $orderId = 'ORD' . time();

        $transaction_data = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount
            ],
            'item_details' => $item_details
        ];

        if ($paymentMethod === 'qris') {
            $transaction_data['payment_type'] = 'qris';
            $transaction_data['qris'] = ['acquirer' => 'gopay'];
        } elseif ($paymentMethod === 'gopay') {
            $transaction_data['payment_type'] = 'gopay';
            $transaction_data['gopay'] = ['enable_callback' => true, 'callback_url' => 'https://7b2b-2400-9800-820-4ce1-fab3-12a2-2d7b-7e84.ngrok-free.app/api/midtrans/webhook'];
        } elseif ($paymentMethod === 'shopeepay') {
            $transaction_data['payment_type'] = 'shopeepay';
            $transaction_data['shopeepay'] = ['callback_url' => 'https://7b2b-2400-9800-820-4ce1-fab3-12a2-2d7b-7e84.ngrok-free.app/api/midtrans/webhook'];
        } elseif (in_array($paymentMethod, ['bca', 'bni', 'bri', 'permata'])) {
            $transaction_data['payment_type'] = 'bank_transfer';
            $transaction_data['bank_transfer'] = ['bank' => $paymentMethod];
        } else {
            return response()->json(['error' => 'Invalid payment method'], 400);
        }


        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])
            ->withBasicAuth(config('midtrans.server_key'), '')
            // ->post('https://api.midtrans.com/v2/charge', $transaction_data); //production
            ->post('https://api.sandbox.midtrans.com/v2/charge', $transaction_data); //sandbox

            if ($response->successful()) {
                $responseData = $response->json();
                $status = 'pending';
                $trans = Transaction::create([
                    'product_id' => $request->input('id'),
                    'product_name' => $request->input('product_name'),
                    'buyer_sku_code' => $request->input('buyer_sku_code'),
                    // 'buyer_sku_code' => 'xld10', //percobaan dari digiflazz
                    'customer_no' => $customerNo,
                    'order_id' => $orderId,
                    'gross_amount' => $grossAmount,
                    'transaction_id' => $responseData['transaction_id'] ?? null,
                    'payment_status' => $status,
                    'payment_type' => $request->input('payment_type'),
                    'status_message' => $responseData['status_message'],
                    'payment_method_name' => $paymentMethod,
                    'wa_pembeli' => $request->input('wa_pembeli'),
                    'url' => $this->getPaymentUrlOrVa($responseData),
                ]);

                Cache::put('transkey_' . $orderId, $responseData, now()->addMinutes(15)); // simpan selama 15 menit

                return response()->json([
                    'message' => 'Payment created',
                    'data' => $responseData,
                    'transaksi' => $trans
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to create payment',
                    'message' => $response->body()
                ], $response->status());
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Exception occurred',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getPaymentUrlOrVa(array $responseData)
    {
        // Untuk QRIS
        if (isset($responseData['actions']) && isset($responseData['actions'][0]['url'])) {
            return $responseData['actions'][0]['url'];
        }

        // Untuk Bank Transfer (VA)
        if (isset($responseData['va_numbers']) && isset($responseData['va_numbers'][0]['va_number'])) {
            return $responseData['va_numbers'][0]['va_number'];
        }        

        return null;
    }

    public function handle(Request $request)
{
    Log::info('📥 Midtrans Webhook received:', $request->all());

    $serverKey = config('midtrans.server_key');
    $signatureKey = hash('sha512',
        $request->input('order_id') .
        $request->input('status_code') .
        $request->input('gross_amount') .
        $serverKey
    );

    if ($signatureKey !== $request->input('signature_key')) {
        Log::warning('🚫 Invalid Signature Key');
        return response()->json(['message' => 'Invalid Signature'], 403);
    }

    $orderId = $request->input('order_id');
    $status = $request->input('transaction_status');

    $order = Transaction::where('order_id', $orderId)->first();

    if (!$order) {
        Log::warning("⚠️ Transaction with order_id {$orderId} not found");
        return response()->json(['message' => 'Transaction not found'], 404);
    }

    switch ($status) {
        case 'settlement':
            $order->payment_status = 'settlement';
            $order->save();

            // Dispatch topup ke DigiFlazz
            DigiflazzTopup::dispatch($order);
            break;

        case 'pending':
            $order->payment_status = 'pending';
            $order->save();
            break;

        case 'cancel':
        case 'expire':
            $order->payment_status = 'failed';
            Cache::forget('transkey_' . $orderId);
            $order->save();
            break;
    }

    Log::info("✅ Transaction {$orderId} updated to payment_status: {$status}");

    return response()->json(['message' => 'Webhook processed'], 200);
}


    public function checkTransactionStatus(Request $request)
    {
        $orderId = $request->input('order_id');

        $transaction = Transaction::where('order_id', $orderId)->first();

        if (!$transaction) {
            return response()->json(['error' => 'Transaction not found'], 404);
        }

        return response()->json([
            'status' => $transaction->payment_status,
            'message' => $transaction->status_message,
            'payment_type' => $transaction->payment_type,
            'updated_at' => $transaction->updated_at,
            'transaction' => $transaction,
        ]);
    }
}
