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
        Schema::create('transactions', function (Blueprint $table) {
    $table->id();

    $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');

    $table->foreignId('product_id')->nullable();
    $table->string('product_name')->nullable();
    $table->string('customer_no'); 
    $table->string('buyer_sku_code');

    $table->string('order_id')->unique();
    $table->string('transaction_id')->nullable()->unique();

    $table->unsignedBigInteger('gross_amount');

    $table->string('payment_type')->nullable(); 
    $table->string('payment_method_name')->nullable(); 

    $table->string('payment_status')->default('pending');
    $table->string('status_message')->nullable();

    $table->string('digiflazz_status')->nullable();
    $table->string('ref_id')->nullable();
    $table->string('serial_number')->nullable(); 
    $table->string('url')->nullable();
    $table->string('deeplink_gopay')->nullable();
    $table->string('wa_pembeli'); 

    $table->timestamps();

    $table->index(['customer_no']);
    $table->index(['payment_status']);
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
