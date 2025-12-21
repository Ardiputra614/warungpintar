<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PagesController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\TopupController;
use App\Http\Controllers\TransactionController;
use App\Jobs\DigiflazzTopup;
use Illuminate\Foundation\Application;
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

// Route::get('/', [HomeController::class, 'index']);
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/games', [HomeController::class, 'games'])->name('games');
Route::get('/history/{orderId}', [HomeController::class, 'history'])->name('history');
Route::get('/payment/channels', [PaymentController::class, 'getPaymentChannels']);
Route::post('/payment/create', [PaymentController::class, 'createTransaction']);
Route::get('/{slug}', [TopupController::class, 'Topup']);
Route::get('/pascabayar/{slug}', [TopupController::class, 'PascaBayar']);
Route::get('/providertopup/{slug}/{category}', [TopupController::class, 'ProviderTopup']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Payment Routes
    
    //ROUTE ADMIN
    Route::prefix('/admin')->group(function(){
        Route::get('/dashboard', [AdminController::class, 'index']);
        Route::get('/setting', [AdminController::class, 'setting']);
        Route::resource('payment-method', PaymentMethodController::class);
        Route::resource('transaction', TransactionController::class);
        Route::resource('provider', ProviderController::class);
    });
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
