<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('practitioner_id')->nullable(); // pas de FK forte
            $table->date('periode_debut')->nullable();
            $table->date('periode_fin')->nullable();
            $table->decimal('montant_total_ht', 12, 2)->default(0);
            $table->integer('nombre_usages')->default(0);
            $table->string('statut', 20)->default('calcule'); // calcule | paye
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('practitioner_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
    }
};

