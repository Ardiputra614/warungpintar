<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DigiflazzTopup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle($order): void
    {
    //     $refId = $order->order_id;
    //     // $order = Transaction::where('order_id', $orderId)->first();
    //     $signature = md5(env('DIGIFLAZZ_USERNAME') . env('DIGIFLAZZ_PROD_KEY') . $refId);

    // $digiflazzResponse = Http::post('https://api.digiflazz.com/v1/transaction', [
    //     "username" => env('DIGIFLAZZ_USERNAME'),
    //     "buyer_sku_code" => $order->buyer_sku_code,
    //     "customer_no" => $order->customer_no,
    //     // "buyer_sku_code" => 'ML600',
    //     // "customer_no" => '136998338815636',
    //     "ref_id" => $refId,
    //     "testing" => false,
    //     "sign" => $signature,
    // ]);    

    // $responseData = json_decode($digiflazzResponse, true);
    //             if (($responseData['data']['rc'] ?? null) == '00') {
    //                 Cache::forget('transkey_' . $refId); // hapus cache jika sukses
    //                 Log::info("Topup success for order {$refId}, cache removed.");
    //             } else {
    //                 Log::warning("Topup failed for order {$refId}, will keep cache for retry.");
    //             }

    Log::info('✅ TestQueueJob dijalankan dengan sukses.');
    }
}
