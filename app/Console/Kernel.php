<?php

namespace App\Console;

use App\Jobs\DigiflazzTopup;
use App\Models\Transaction;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        $schedule->command('app:retry-digiflazz-cutoff')
        ->everyFiveMinutes()
        ->withoutOverlapping()
        ->runInBackground();

        $schedule->call(function () {
        app(\App\Services\DigiflazzProductService::class)
        ->syncStatus();
        })
        ->everyTenMinutes()
        ->name('digiflazz-sync-status')
        ->withoutOverlapping();

        $schedule->call(function () {
            Transaction::where('digiflazz_status', 'pending')
                ->where('retry_at', '<=', now())
                ->each(fn ($trx) => DigiflazzTopup::dispatch($trx->id));
        })->everyMinute();


    }
//     protected function schedule(Schedule $schedule): void
// {
//     // 🔄 Sync status Digiflazz
//     $schedule->call(function () {
//         app(\App\Services\DigiflazzProductService::class)->syncStatus();
//     })
//     ->everyTenMinutes()
//     ->name('digiflazz-sync-status')
//     ->withoutOverlapping();

//     // 🚀 Dispatch retry Digiflazz (AMAN)
//     $schedule->call(function () {

//         Transaction::where('digiflazz_status', 'pending')
//             ->where('retry_at', '<=', now())
//             ->limit(20)
//             ->each(function ($trx) {
//                     DigiflazzTopup::dispatch($trx->id)
//                         ->onQueue('digiflazz');
//                 });

//     })
//     ->everyMinute()
//     ->name('dispatch-digiflazz-pending')
//     ->withoutOverlapping();
// }


    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
