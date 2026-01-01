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
        Schema::create('profil_aplikasis', function (Blueprint $table) {
            $table->id();
            $table->string('application_name');
            $table->string('application_fee'); //nominal
            $table->decimal('saldo')->default(0);
            $table->longText('terms_condition');
            $table->longText('privacy_policy');
            $table->string('logo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profil_aplikasis');
    }
};
