<?php

namespace App\Services;

use App\Models\ProfilAplikasi;
use Illuminate\Support\Facades\DB;

class DigiflazzBalanceService
{
    public static function debit(float $amount)
    {
        DB::transaction(function () use ($amount) {
            $profil = ProfilAplikasi::lockForUpdate()->first();

            if ($profil->saldo < $amount) {
                throw new \Exception('Saldo Digiflazz tidak cukup');
            }

            $profil->decrement('saldo', $amount);
        });
    }

    public static function credit(float $amount)
    {
        DB::transaction(function () use ($amount) {
            ProfilAplikasi::lockForUpdate()->first()->increment('saldo', $amount);
        });
    }
}
