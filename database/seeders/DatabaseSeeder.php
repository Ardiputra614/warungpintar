<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\GamesCategory;
use App\Models\PaymentMethod;
use App\Models\PlnCategory;
use App\Models\ProfilAplikasi;
use App\Models\Provider;
use App\Models\Tagihan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Profiler\Profile;

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

        ProfilAplikasi::create([
            'application_name' => 'Warung Pintar',
            'application_fee' => '0',
            'logo' => '#',
            'saldo' => 0,
            'terms_condition' => 'Syarat dan Ketentuan ARVE SHOP


Dengan menggunakan aplikasi dan layanan ARVE SHOP, Pengguna dianggap telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan berikut.\n

1. Definisi
ARVE SHOP adalah aplikasi PPOB yang menyediakan layanan top up, pembayaran digital, dan produk elektronik lainnya.
Pengguna adalah setiap individu yang mengakses atau menggunakan layanan ARVE SHOP.

2. Ketentuan Umum
- Pengguna wajib memberikan data yang benar dan dapat dipertanggungjawabkan
- ARVE SHOP berhak menolak transaksi yang terindikasi melanggar hukum
- Layanan dapat digunakan tanpa login untuk fitur tertentu\n

3. Transaksi
- Semua transaksi bersifat final dan tidak dapat dibatalkan\n
- Kesalahan input nomor tujuan menjadi tanggung jawab Pengguna
- Status transaksi mengikuti hasil dari provider (DigiFlazz / pihak ketiga)

4. Pembayaran\n
- Pembayaran dilakukan melalui metode yang tersedia (Bank, QRIS, dll)
- Status pembayaran akan diperbarui otomatis setelah pembayaran berhasil
- ARVE SHOP tidak bertanggung jawab atas keterlambatan dari pihak payment gateway

5. Kegagalan Transaksi
- Jika transaksi gagal dan saldo terpotong, sistem akan melakukan refund otomatis
- Proses refund mengikuti kebijakan provider terkait

6. Harga dan Biaya
- Harga produk dapat berubah sewaktu-waktu\n
- Total pembayaran yang ditampilkan sudah termasuk biaya layanan

7. Kewajiban Pengguna\n
Pengguna dilarang:
- Melakukan aktivitas penipuan\n
- Menggunakan layanan untuk tujuan ilegal\n
- Menyalahgunakan sistem atau celah keamanan\n

8. Tanggung Jawab ARVE SHOP
ARVE SHOP bertanggung jawab sebatas memproses transaksi sesuai data yang dimasukkan Pengguna.

9. Perubahan Layanan
ARVE SHOP berhak mengubah, menambah, atau menghentikan layanan kapan saja tanpa pemberitahuan sebelumnya.

10. Pembatasan Tanggung Jawab
ARVE SHOP tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, atau gangguan layanan di luar kendali sistem.

11. Hukum yang Berlaku
Syarat dan Ketentuan ini diatur dan tunduk pada hukum Republik Indonesia.

12. Kontak Layanan
Email: arfenaz@gmail.com
WhatsApp: Layanan Pelanggan ARVE SHOP

Dengan menggunakan layanan ARVE SHOP, Pengguna dianggap telah menyetujui seluruh Syarat dan Ketentuan ini.

',
            'privacy_policy' => 'Kebijakan Privasi ARVE SHOP


Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana ARVE SHOP mengumpulkan, menggunakan, dan melindungi data pribadi Pengguna.\n

1. Data yang Dikumpulkan
Kami dapat mengumpulkan data berikut:
- Nomor handphone
- Email
- Data transaksi
- Informasi perangkat (alamat IP, browser, sistem operasi)\n

2. Penggunaan Data\n
Data digunakan untuk:
- Memproses transaksi PPOB
- Mengirim notifikasi status transaksi
- Keamanan dan verifikasi akun
- Peningkatan kualitas layanan

3. Keamanan Data
ARVE SHOP berkomitmen untuk menjaga keamanan data pribadi Pengguna dengan sistem pengamanan yang wajar dan sesuai standar.

4. Berbagi Data
Data pribadi dapat dibagikan kepada:
- Provider produk digital
- Mitra pembayaran (bank / payment gateway)
- Pihak berwenang jika diwajibkan oleh hukum

5. Cookie dan Teknologi
Kami dapat menggunakan cookie atau teknologi serupa untuk menyimpan preferensi dan meningkatkan pengalaman pengguna.

6. Hak Pengguna
Pengguna berhak untuk:
- Mengakses dan memperbarui data pribadi
- Meminta penghapusan data sesuai ketentuan yang berlaku
- Menghubungi layanan pelanggan terkait privasi

7. Penyimpanan Data
Data pribadi disimpan selama diperlukan untuk keperluan layanan dan sesuai ketentuan hukum yang berlaku.

8. Perubahan Kebijakan\n
ARVE SHOP berhak mengubah Kebijakan Privasi ini sewaktu-waktu. Perubahan berlaku sejak ditampilkan di aplikasi atau website.

9. Persetujuan
Dengan menggunakan layanan ARVE SHOP, Pengguna dianggap telah menyetujui Kebijakan Privasi ini.

10. Kontak
Email: arfenaz@gmail.com
WhatsApp: Layanan Pelanggan ARVE SHOP

'

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
