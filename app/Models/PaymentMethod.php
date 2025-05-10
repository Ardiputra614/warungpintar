<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PaymentMethod extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    // Di YourModel.php
    protected static function booted()
    {
        static::deleting(function ($model) {
            if ($model->logo && Storage::disk('public')->exists($model->logo)) {
                Storage::disk('public')->delete($model->logo);
            }
        });
    }

}
