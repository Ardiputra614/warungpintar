<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            
            // User & Product Info
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable();
            $table->string('product_name')->nullable();
            $table->string('product_type')->nullable(); // tambah: pulsa, pln, game, pdam, dll
            $table->string('customer_no'); 
            $table->string('buyer_sku_code');
            
            // Transaction IDs
            $table->string('order_id')->unique();
            $table->string('transaction_id')->nullable()->unique();
            
            // Payment Info
            $table->unsignedBigInteger('gross_amount');
            $table->unsignedBigInteger('selling_price')->nullable(); // harga jual ke customer
            $table->unsignedBigInteger('purchase_price')->nullable(); // harga beli dari digiflazz
            
            $table->string('payment_type')->nullable(); 
            $table->string('payment_method_name')->nullable(); 
            
            // Status
            $table->string('payment_status')->default('pending');
            $table->string('digiflazz_status')->nullable();
            $table->string('status_message')->nullable();
            
            // Product Specific Data
            $table->string('ref_id')->nullable(); // sama dengan order_id di DigiFlazz
            $table->string('serial_number')->nullable(); 
            $table->string('customer_name')->nullable(); // nama pelanggan (untuk pln/pdam)
            $table->string('meter_no')->nullable(); // no meter untuk pln
            $table->string('subscriber_id')->nullable(); // id pelanggan (untuk game)
            $table->decimal('kwh', 10, 2)->nullable(); // jumlah kwh untuk token pln
            $table->string('voucher_code')->nullable(); // kode voucher (game/pulsa)
            $table->text('note')->nullable(); // catatan tambahan
            
            // URLs & Contact
            $table->string('url')->nullable();
            $table->string('deeplink_gopay')->nullable();
            $table->string('wa_pembeli');
            
            // Raw Data
            $table->json('digiflazz_request')->nullable(); // data request ke digiflazz
            $table->json('digiflazz_response')->nullable(); // response dari digiflazz
            $table->json('digiflazz_callback')->nullable(); // data callback/webhook
            
            $table->timestamps();
            
            // Indexes
            $table->index(['customer_no']);
            $table->index(['payment_status']);
            $table->index(['digiflazz_status']);
            $table->index(['product_type']);
            $table->index(['ref_id']);
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};