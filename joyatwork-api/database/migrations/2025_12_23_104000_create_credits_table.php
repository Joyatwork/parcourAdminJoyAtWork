<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entreprise_id');
            $table->unsignedBigInteger('order_line_id')->nullable();
            $table->string('type_service', 100);
            $table->integer('quantite_initiale')->default(0);
            $table->integer('quantite_restante')->default(0);
            $table->date('date_expiration')->nullable();
            $table->timestamps();

            $table->index('entreprise_id');
            $table->index('order_line_id');
            $table->foreign('entreprise_id')
                ->references('id')
                ->on('companies')
                ->onDelete('cascade');
            $table->foreign('order_line_id')
                ->references('id')
                ->on('order_lines')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credits');
    }
};

