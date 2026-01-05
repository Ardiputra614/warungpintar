<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilAplikasi extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    public static function getApp(): ?self
    {
        return self::first();
    }

    /**
     * Check if saldo cukup
     */
    public function hasSufficientBalance(float $amount): bool
    {
        return $this->saldo >= $amount;
    }

    /**
     * Format saldo ke rupiah
     */
    public function getSaldoFormattedAttribute(): string
    {
        return 'Rp ' . number_format($this->saldo, 0, ',', '.');
    }
    
}
