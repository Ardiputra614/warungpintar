<?php

use App\Services\DigiflazzProductService;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProfilAplikasiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TopupController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WhatsappController;
use App\Jobs\DigiflazzTopup;
use App\Models\Transaction;
use App\Models\Whatsapp;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::get('/test-queue', function () {
    $order = [
        'nama' => 'Ardianto',
        'profesi' => 'programer'
    ];
    DigiflazzTopup::dispatch($order);
    return 'Job dikirim!';
});
Route::get('/test-wa', function () {

    // Dummy data untuk transaksi
    $transaction = new class {
        public $id = 1;
        public $product_name = "Produk Test";
        public $gross_amount = 150000;
        public $wa_pembeli = "6287864705663";
        public $updated_at;

        public function __construct()
        {
            $this->updated_at = now();
        }
    };

    // Template WA
    $template = "✅ *Transaksi Berhasil!*\n\n" .
        "🧾 Produk : {$transaction->product_name}\n" .
        "💳 Nominal : Rp " . number_format($transaction->gross_amount, 0, ',', '.') . "\n" .
        "📱 Nomor Tujuan : {$transaction->wa_pembeli}\n" .
        "🕒 Waktu : {$transaction->updated_at}\n\n" .
        "Terima kasih telah menggunakan layanan kami 🙏";

    // Kirim request ke Fonnte / server lokal
    $response = Http::post('http://localhost:3000/api/send-message', [
        "device_id" => "device_1768023022655_rsq1h88o3",
        "target" => $transaction->wa_pembeli,
        "message" => $template,
        "delay" => 3000
    ]);

    // Logging hasil
    if (! $response->successful()) {
        Log::error('Gagal kirim WA', [
            'response' => $response->body()
        ]);
        return response()->json([
            'status' => 'error',
            'response' => $response->body()
        ]);
    }

    return response()->json([
        'status' => 'success',
        'message' => $template,
        'response' => $response->body()
    ]);
});


// Route untuk sync semua produk
Route::get('/digiflazz/sync', function (DigiflazzProductService $service) {
    $start = microtime(true);
    
    try {
        $result = $service->syncStatus();
        
        return response()->json([
            'success' => $result,
            'message' => $result ? 'Sync berhasil' : 'Sync gagal',
            'execution_time' => round(microtime(true) - $start, 2) . ' seconds',
            'timestamp' => now()->toDateTimeString(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'execution_time' => round(microtime(true) - $start, 2) . ' seconds',
            'timestamp' => now()->toDateTimeString(),
        ], 500);
    }
});

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/cek-transaksi', [HomeController::class, 'cekTransaksi'])->name('cekTransaksi');
Route::get('/games', [HomeController::class, 'games'])->name('games');
Route::get('/history/{orderId}', [HomeController::class, 'history'])->name('history');
Route::get('/payment/channels', [PaymentController::class, 'getPaymentChannels']);
Route::post('/payment/create', [PaymentController::class, 'createTransaction']);
Route::get('/pascabayar/{slug}', [TopupController::class, 'PascaBayar']);
Route::get('/providertopup/{slug}/{category}', [TopupController::class, 'ProviderTopup']);
Route::get('/term-condition', [HomeController::class, 'termCondition']);
Route::get('/privacy-policy', [HomeController::class, 'privacyPolicy']);
Route::get('/contact', [HomeController::class, 'contact']);


Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Payment Routes
    
    //ROUTE ADMIN
    Route::prefix('/admin')->group(function(){
        Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
        Route::get('/setting', [AdminController::class, 'setting']);
        Route::resource('payment-method', PaymentMethodController::class);
        Route::resource('transaction', TransactionController::class);
        Route::resource('provider', ProviderController::class);
        Route::resource('profil-aplikasi', ProfilAplikasiController::class);
        Route::resource('service', ServiceController::class);
        // Route::get('/whatsapp', [AdminController::class, 'wa'])->name('whatsapp');
        Route::resource('whatsapp', WhatsappController::class);
        Route::get('/transactions/chart-data', [TransactionController::class, 'chartData']);
        
    });
});

Route::prefix('api/wa-engine')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('/devices', [WhatsappController::class, 'getDevices']);
    Route::post('/device/add', [WhatsappController::class, 'addDevice']);
    Route::get('/qr/{deviceId}', [WhatsappController::class, 'getQrCode']);
    Route::post('/qr/{deviceId}/refresh', [WhatsappController::class, 'refreshQrCode']);
    Route::delete('/device/{id}', [WhatsappController::class, 'deleteDevice']);
    Route::post('/send-message', [WhatsappController::class, 'sendMessage']);
    Route::get('/stats', [WhatsappController::class, 'getStats']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/payment/channels', [PaymentController::class, 'getPaymentChannels']);
    Route::post('/payment/create', [PaymentController::class, 'createTransaction']);
});

Route::post('/payment/callback', [PaymentController::class, 'callback']);
Route::post('/payment/callback', [PaymentController::class, 'callback']);
Route::get('/page', [PagesController::class, 'index']);

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/coba/get', function() {
    $d = Transaction::with('produk')->find('1');
    dd($d);
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

Route::get('/{slug}', [TopupController::class, 'Topup']);




// Route::prefix('admin')->group(function() {
//     Route::get('/dashboard', [AdminController::class, 'index']);
//     Route::resource('/profil-aplikasi', ProfilAplikasiController::class);
//     Route::resource('/service', ServiceController::class);
//     Route::get('/whatsapp', [WhatsappController::class, 'index']);
// });
