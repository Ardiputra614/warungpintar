<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Kategori extends Model
{
    use HasFactory;
    protected $guarded = ['id'];

    protected $casts = [
        'photos' => 'array', // Tambahkan ini supaya photos otomatis jadi array
    ];

    protected static function booted()
    {
        static::deleting(function ($kategori) {
            if (is_array($kategori->photos)) {
                foreach ($kategori->photos as $file) {
                    if ($file && Storage::disk('public')->exists($file)) {
                        Storage::disk('public')->delete($file);
                    }
                }
            }
        });
    }
}
