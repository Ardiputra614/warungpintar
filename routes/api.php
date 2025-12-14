<?php

use App\Http\Controllers\DigiflazzController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\WaSendController;
use App\Http\Controllers\TopupController;
use App\Http\Controllers\PaymentMethodController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/getproduk', [ProdukController::class, 'getProduk']);
Route::get('/getgames', [KategoriController::class, 'getGames']);
Route::get('/getprovider', [KategoriController::class, 'getProvider']);
Route::get('/gettagihan', [KategoriController::class, 'getTagihan']);

//untuk getproduk berdasarkan brand
Route::get('/getproduk/{brand}', [TopupController::class, 'getprodukwithbrand']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/topup/{orderId}', [DigiflazzController::class, 'topup']);

Route::post('/midtrans/transaction', [MidtransController::class, 'createTransaction']);
Route::post('/midtrans/webhook', [MidtransController::class, 'handle']);
Route::get('/transaction/status', [MidtransController::class, 'checkTransactionStatus']);
Route::post('/webhookdigiflazz', [DigiflazzController::class, 'handleDigiflazz']);



//route untuk ngambil produk dari digiflazz insert ke database
Route::post('/dataproduk', [DigiflazzController::class, 'getProducts']);

//ROute untuk kirim pesan wa after transaksi
Route::post('wa-send', [WaSendController::class, 'WaSend']);

//route untuk ambil payment method on untuk react-native
Route::get('payment-method', [PaymentMethodController::class, 'paymentmethodon']);


Route::post('/inquiry-pln/{customer_no}', [TopupController::class, 'inquiryPln']);

