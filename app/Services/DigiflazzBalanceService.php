<?php

namespace App\Services;

use App\Models\ProfilAplikasi;
use Exception;
use Illuminate\Support\Facades\DB;

class DigiflazzBalanceService
{
    public static function debit(int $amount): void
    {
        DB::transaction(function () use ($amount) {
            $profile = ProfilAplikasi::lockForUpdate()->first();

            if ($profile->saldo < $amount) {
                throw new Exception('Saldo tidak mencukupi');
            }

            $profile->decrement('saldo', $amount);
        });
    }

    public static function credit(float $amount)
    {
        DB::transaction(function () use ($amount) {
            ProfilAplikasi::lockForUpdate()->first()->increment('saldo', $amount);
        });
    }
}
