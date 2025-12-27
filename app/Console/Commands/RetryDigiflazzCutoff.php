<?php

namespace App\Console\Commands;

use App\Jobs\DigiflazzTopup;
use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RetryDigiflazzCutoff extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:retry-digiflazz-cutoff';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Transaction::where('digiflazz_status', 'pending')
            ->where('retry_at', '<=', now())
            ->where('retry_count', '<', 5)
            ->limit(20)
            ->get()
            ->each(function ($trx) {
                Log::info('🔁 Retry Digiflazz', [
                    'order_id' => $trx->order_id,
                    'retry' => $trx->retry_count,
                ]);

                DigiflazzTopup::dispatch($trx->id)->delay(3);
            });
    }
}
