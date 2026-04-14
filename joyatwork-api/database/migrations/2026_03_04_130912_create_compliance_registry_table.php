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
        Schema::create('compliance_registry', function (Blueprint $table) {
            $table->id();
             $table->string('name');
    $table->text('purpose');
    $table->string('data_type');
    $table->string('retention_period');
            $table->timestamps();
            
   
   
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_registry');
    }
};
