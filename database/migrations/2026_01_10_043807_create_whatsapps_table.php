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
        Schema::create('whatsapps', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('name');
            $table->string('number');
            $table->text('qr_code');
            $table->string('status');
            $table->integer('messages_sent')->default(0);
            $table->integer('messages_failed')->default(0);
            $table->string('last_activity')->nullable();
            $table->string('uptime');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapps');
    }
};
