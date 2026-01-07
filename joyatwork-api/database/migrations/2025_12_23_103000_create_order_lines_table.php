<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->string('type_service', 100);
            $table->integer('quantite')->default(0);
            $table->decimal('prix_unitaire_ht', 12, 2)->default(0);
            $table->decimal('montant_ligne_ht', 12, 2)->default(0);
            $table->decimal('part_joyatwork_pct', 5, 2)->default(0); // ex: 30.00
            $table->decimal('part_praticien_pct', 5, 2)->default(0); // ex: 70.00
            $table->timestamps();

            $table->index('order_id');
            $table->foreign('order_id')
                ->references('id')
                ->on('orders')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_lines');
    }
};

