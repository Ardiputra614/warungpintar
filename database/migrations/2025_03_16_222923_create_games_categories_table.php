<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('games_categories', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->default('#3B82F6');
            $table->string("category");
            
            // Description
            $table->text('description')->nullable();
            $table->text('how_to_topup')->nullable();
            $table->text('notes')->nullable();
            
            // Customer Number Format Configuration
            $table->enum('customer_no_format', [
                'satu_input',              // Contoh: 123456789
                'dua_input',    // Contoh: 123456789+1234                
            ])->default('satu_input');
            
            // Format Examples and Configuration
            $table->text('example_format')->nullable();
            $table->string('field1_label')->default('User ID');
            $table->string('field1_placeholder')->default('Masukkan User ID');
            $table->string('field2_label')->nullable();
            $table->string('field2_placeholder')->nullable();
            $table->string('separator')->nullable();
            $table->text('format_description')->nullable();
            
            // Validation Rules (JSON)
            $table->json('validation_rules')->nullable();
                                    
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->integer('sort_order')->default(0);
            $table->integer('view_count')->default(0);                    
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for Performance
            $table->index(['slug', 'is_active']);
            $table->index(['is_active', 'is_featured', 'sort_order']);
            $table->index(['is_active', 'is_popular', 'sort_order']);
            $table->index(['customer_no_format', 'is_active']);
            $table->index('created_at');
            $table->index('updated_at');
        });
        
        // Seed Initial Data
        $this->seedGamesCategories();
    }
    
    private function seedGamesCategories(): void
    {
        $games = [
            [
                'name' => 'Mobile Legends',
                'slug' => 'mobile-legends',
                'category' => 'games',
                'customer_no_format' => 'dua_input',
                'field1_label' => 'User ID',
                'field1_placeholder' => 'Masukkan User ID',
                'field2_label' => 'Zone ID',
                'field2_placeholder' => 'Masukkan Zone ID',
                'separator' => '+',
                'example_format' => '123456789+1234',
                'format_description' => 'Masukkan User ID dan Zone ID dipisah dengan tanda +',
                'description' => 'Top Up Diamond Mobile Legends Bang Bang',
                'color' => '#FF6B00',
            ],
            [
                'name' => 'Free Fire',
                'slug' => 'free-fire',
                'category' => 'games',
                'customer_no_format' => 'satu_input',
                'field1_label' => 'User ID',
                'field1_placeholder' => 'Masukkan User ID',
                'example_format' => '1234567890',
                'format_description' => 'Masukkan User ID game Anda',
                'description' => 'Top Up Diamond Free Fire',
                'color' => '#FF4757',
            ],
            [
                'name' => 'Valorant',
                'slug' => 'valorant',
                'category' => 'games',
                'customer_no_format' => 'dua_input',
                'field1_label' => 'Username',
                'field1_placeholder' => 'Masukkan Username',
                'field2_label' => 'Tagline',
                'field2_placeholder' => 'Masukkan Tagline',
                'separator' => '#',
                'example_format' => 'PlayerOne#1234',
                'format_description' => 'Masukkan Username dan Tagline dipisah dengan tanda #',
                'description' => 'Top Up Valorant Points',
                'color' => '#FA4454',
            ],            
            [
                'name' => 'XL',
                'slug' => 'xl',
                'category' => 'provider',
                'customer_no_format' => 'satu_input',
                'field1_label' => 'Nomor handphone',
                'field1_placeholder' => 'Masukkan Nomor handphone',
                'field2_label' => null,
                'field2_placeholder' => null,
                'separator' => '+',
                'example_format' => 'phone',
                'format_description' => 'Masukkan Nomor Handphone',
                'description' => 'Top Up Data dan Pulsa',
                'color' => '#8B4513',
            ],
            [
                'name' => 'PLN',
                'slug' => 'pln',
                'category' => 'pln',
                'customer_no_format' => 'satu_input',
                'field1_label' => 'Nomor Meter',
                'field1_placeholder' => 'Masukkan Nomor meter',
                'field2_label' => null,
                'field2_placeholder' => null,
                'separator' => '+',
                'example_format' => 'phone',
                'format_description' => 'Masukkan Nomor meter',
                'description' => 'Top Up PLN',
                'color' => '#8B4513',
            ],
        ];
        
        foreach ($games as $game) {
            DB::table('games_categories')->insert($game);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('games_categories');
    }
};