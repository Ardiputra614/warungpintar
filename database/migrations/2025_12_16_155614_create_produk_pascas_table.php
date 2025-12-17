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
        Schema::create('produk_pascas', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('slug');
            $table->string('category');
            $table->string('brand');            
            $table->string('seller_name');
            $table->string('price'); //harga digiflazz/harga beli
            $table->string('selling_price');//harga jual= harga beli yang sudah ditambahkan 1000 atau lainnya rupiah
            $table->string('buyer_sku_code');
            $table->string('buyer_product_status');
            $table->boolean('seller_product_status');                        
            $table->string('start_cut_off');
            $table->string('end_cut_off');
            $table->string('admin');
            $table->string('commission');
            $table->string('desc');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produk_pascas');
    }
};
