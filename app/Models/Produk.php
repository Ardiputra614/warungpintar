<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    public function getKeyName()
    {
        return 'slug';
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'product_id');
    }
}
