<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('company_appointments')) {
            return;
        }

        Schema::create('company_appointments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entreprise_id')->index();
            $table->dateTime('scheduled_at');
            $table->string('status')->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_appointments');
    }
};
