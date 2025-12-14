<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\GamesCategory;
use App\Models\PaymentMethod;
use App\Models\PlnCategory;
use App\Models\Provider;
use App\Models\Tagihan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        User::create([
            'name' => 'Arfenaz',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('12345'),
        ]);

        Provider::create([
            'name' => 'AXIS',
            'slug' => 'axis',
            'logo' => 'https://api.unsplash.com/photos?query=random'
        ]);
        Provider::create([
            'name' => 'XL',
            'slug' => 'xl',
            'logo' => 'https://api.unsplash.com/photos/?query=random'
        ]);
        Provider::create([
            'name' => 'TELKOMSEL',
            'slug' => 'telkomsel',
            'logo' => 'https://api.unsplash.com/photos?query=random'
        ]);

        Provider::create([
            'name' => 'INDOSAT',
            'slug' => 'indosat',
            'logo' => 'https://api.unsplash.com/photos?query=random'
        ]);
        Provider::create([
            'name' => 'by.U',
            'slug' => 'byu',
            'logo' => 'https://api.unsplash.com/photos?query=random'
        ]);
        Provider::create([
            'name' => 'SMARTFREN',
            'slug' => 'smartfren',
            'logo' => 'https://api.unsplash.com/photos?query=random'
        ]);

        // GamesCategory::create([
        //     'name' => 'MOBILE LEGENDS',
        //     'slug' => 'mobile-legends',
        //     'logo' => 'https://api.unsplash.com/photos?query=random'
        // ]);

        Tagihan::create([
            'name' => 'PLN',
            'slug' => 'pln',
            'logo' => 'https://api.unsplash.com/photos/mount'
        ]);
        
            PaymentMethod::create([
                'name' => 'bca',
                'nominal_fee' => 1500,
                'percentase_fee' => 0.0,
                'type' => 'bank_transfer',
                'status' => 'off',
            ]);
            PaymentMethod::create([
                'name' => 'qris',
                'nominal_fee' => 0,
                'percentase_fee' => 0.7,
                'type' => 'qris',
                'status' => 'off',
            ]);
            PaymentMethod::create([
                'name' => 'bni',
                'nominal_fee' => 4000,
                'percentase_fee' => 0,
                'type' => 'bank_transfer',
                'status' => 'on',
            ]);
            PaymentMethod::create([
                'name' => 'bri',
                'nominal_fee' => 4000,
                'percentase_fee' => 0,
                'type' => 'bank_transfer',
                'status' => 'on',
            ]);
            PaymentMethod::create([
                'name' => 'gopay',
                'nominal_fee' => 4000,
                'percentase_fee' => 0,
                'type' => 'ewallet',
                'status' => 'on',
            ]);
            PaymentMethod::create([
                'name' => 'shopeepay',
                'nominal_fee' => 4000,
                'percentase_fee' => 0,
                'type' => 'ewallet',
                'status' => 'off',
            ]);
            PaymentMethod::create([
                'name' => 'dana',
                'nominal_fee' => 4000,
                'percentase_fee' => 0,
                'type' => 'ewallet',
                'status' => 'off',
            ]);
    }
}
