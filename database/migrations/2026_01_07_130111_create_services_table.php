<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('icon')->nullable();            
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
                                    
            $table->boolean('is_active')->default(true);            
            $table->boolean('is_popular')->default(false);            
            $table->integer('view_count')->default(0);
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for Performance
            $table->index(['slug', 'is_active']);            
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
                'example_format' => '123456789+1234',
                'format_description' => 'Masukkan User ID dan Zone ID dipisah dengan tanda +',
                'description' => 'Top Up Diamond Mobile Legends Bang Bang',                
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
                'example_format' => 'phone',
                'format_description' => 'Masukkan Nomor Handphone',
                'description' => 'Top Up Data dan Pulsa',                
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
                'example_format' => 'phone',
                'format_description' => 'Masukkan Nomor meter',
                'description' => 'Top Up PLN',                
            ],
        ];
        
        foreach ($games as $game) {
            DB::table('services')->insert($game);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
