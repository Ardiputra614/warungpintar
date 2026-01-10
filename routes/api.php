<?php

use App\Http\Controllers\DigiflazzController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\TopupController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProfilAplikasiController;
use App\Http\Controllers\ServiceController;
use App\Models\ProfilAplikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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
Route::get('/services', [ServiceController::class, 'data']);
Route::post('/services', [ServiceController::class, 'store']);
Route::patch('/services/{services}', [ServiceController::class, 'update']);

//untuk getproduk berdasarkan brand
Route::get('/getproduk/{brand}', [TopupController::class, 'getprodukwithbrand']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/topup/{orderId}', [DigiflazzController::class, 'topup']);

Route::post('/midtrans/transaction', [MidtransController::class, 'createTransaction']);
Route::post('/midtrans/webhook', [MidtransController::class, 'handle']);
Route::get('/transaction/status', [MidtransController::class, 'checkTransactionStatus']);
Route::post('/webhook/digiflazz', [DigiflazzController::class, 'handleDigiflazz']);



//route untuk ngambil produk dari digiflazz insert ke database
Route::post('/dataproduk', [DigiflazzController::class, 'getProducts']);
Route::post('/dataproduk-pasca', [DigiflazzController::class, 'getProductsPasca']);


//route untuk ambil payment method on untuk react-native
Route::get('payment-method', [PaymentMethodController::class, 'paymentmethodon']);


Route::post('/inquiry-pln', [TopupController::class, 'inquiryPln']);


Route::post('/ceksaldo', function() {
    $username = env('DIGIFLAZZ_USERNAME');
        $apiKey   = env('DIGIFLAZZ_PROD_KEY');

        $sign = md5($username . $apiKey . 'depo');

        $response = Http::timeout(15)->post(
            'https://api.digiflazz.com/v1/cek-saldo',
            [
                'cmd'      => 'depo',
                'username' => $username,
                'sign'     => $sign,
            ]
        );

        if ($response->failed()) {
            return response()->json([
                'status' => false,
                'message' => 'Gagal koneksi ke DigiFlazz',
                'error' => $response->body(),
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => 'Koneksi DigiFlazz berhasil',
            'data' => $response->json(),
        ]);
});




//admin custom

Route::get('/profil-aplikasi', [ProfilAplikasiController::class, 'data']);