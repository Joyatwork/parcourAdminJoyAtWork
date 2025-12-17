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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sector');
            $table->string('location');
            $table->integer('employees')->default(0);
            $table->string('phone')->nullable();
            $table->string('email');
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->json('wellness_programs')->nullable(); // Pour stocker les programmes bien-être
            $table->enum('status', ['Actif', 'En négociation', 'Inactif'])->default('Actif');
            $table->decimal('contract_value', 10, 2)->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
