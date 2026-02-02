<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entreprise_id');
            $table->string('numero_commande')->unique();
            $table->decimal('montant_total_ht', 12, 2)->default(0);
            $table->decimal('montant_total_ttc', 12, 2)->default(0);
            $table->string('statut', 20)->default('pending'); // pending | confirmed | cancelled
            $table->date('date_commande')->nullable();
            $table->timestamps();

            $table->index('entreprise_id');
            $table->foreign('entreprise_id')
                ->references('id')
                ->on('companies')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

