<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('companies')) {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sector')->nullable();
            $table->string('location')->nullable();
            $table->integer('employees')->default(0);
            $table->string('phone')->nullable();
            $table->string('email')->unique();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->json('wellness_programs')->nullable();
            $table->string('status')->default('En négociation');
            $table->decimal('contract_value', 10, 2)->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
