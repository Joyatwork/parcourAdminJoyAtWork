<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entreprise_id');
            $table->decimal('balance', 12, 2)->default(0);
            $table->string('devise', 3)->default('EUR');
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->unique('entreprise_id');
            $table->foreign('entreprise_id')
                ->references('id')
                ->on('companies')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
