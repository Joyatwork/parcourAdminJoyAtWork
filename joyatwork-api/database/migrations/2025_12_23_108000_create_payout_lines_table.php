<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payout_id');
            $table->unsignedBigInteger('usage_id');
            $table->decimal('montant_ht', 12, 2)->default(0);
            $table->timestamps();

            $table->index('payout_id');
            $table->index('usage_id');
            $table->foreign('payout_id')
                ->references('id')
                ->on('payouts')
                ->onDelete('cascade');
            $table->foreign('usage_id')
                ->references('id')
                ->on('usages')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_lines');
    }
};

