<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entreprise_id');
            $table->string('type', 20)->default('order'); // recharge | order
            $table->string('reference_type')->nullable(); // Order | Recharge
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('numero_facture')->unique();
            $table->decimal('montant_ht', 12, 2)->default(0);
            $table->decimal('montant_ttc', 12, 2)->default(0);
            $table->decimal('taux_tva', 5, 2)->default(20.00);
            $table->string('statut', 20)->default('a_emettre'); // a_emettre | envoyee | payee
            $table->date('date_emission')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('entreprise_id');
            $table->index(['reference_type', 'reference_id']);
            $table->foreign('entreprise_id')
                ->references('id')
                ->on('entreprises')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};

