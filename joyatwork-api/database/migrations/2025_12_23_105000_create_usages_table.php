<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entreprise_id');
            $table->unsignedBigInteger('employee_id')->nullable();      // pas de FK forte, table non définie
            $table->unsignedBigInteger('practitioner_id')->nullable();  // pas de FK forte, table non définie
            $table->unsignedBigInteger('order_line_id')->nullable();
            $table->unsignedBigInteger('credit_id')->nullable();
            $table->string('type_service', 100);
            $table->date('date_prestation')->nullable();
            $table->decimal('prix_ht', 12, 2)->default(0);
            $table->decimal('part_joyatwork_ht', 12, 2)->default(0);
            $table->decimal('part_praticien_ht', 12, 2)->default(0);
            $table->string('statut', 30)->default('valide_auto'); // valide_auto | refuse
            $table->unsignedBigInteger('validated_by')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            $table->index('entreprise_id');
            $table->index('order_line_id');
            $table->index('credit_id');
            $table->index('practitioner_id');
            $table->index('statut');

            $table->foreign('entreprise_id')
                ->references('id')
                ->on('companies')
                ->onDelete('cascade');
            $table->foreign('order_line_id')
                ->references('id')
                ->on('order_lines')
                ->onDelete('set null');
            $table->foreign('credit_id')
                ->references('id')
                ->on('credits')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usages');
    }
};

