<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('slug');
            $table->string('category');
            $table->string('brand');
            $table->string('type');
            $table->string('product_type'); //prepaid / postpaid, untuk ifelse di transaksi history
            $table->string('seller_name');
            $table->string('price'); //harga digiflazz/harga beli
            $table->string('selling_price');//harga jual= harga beli yang sudah ditambahkan fee keuntungan
            $table->string('buyer_sku_code');
            $table->string('buyer_product_status');
            $table->boolean('seller_product_status');
            $table->boolean('unlimited_stock');
            $table->string('stock');
            $table->boolean('multi');
            $table->time('start_cut_off');
            $table->time('end_cut_off');
            $table->string('desc');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
