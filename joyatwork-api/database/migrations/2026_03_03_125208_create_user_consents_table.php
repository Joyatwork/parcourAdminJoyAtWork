<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_consents', function (Blueprint $table) {
            $table->id();

            // Relation avec l'utilisateur
            $table->unsignedBigInteger('user_id');

            // Type de consentement (ex: health_data, marketing, analytics)
            $table->string('consent_type');

            // Date d'acceptation
            $table->timestamp('granted_at')->nullable();

            // Date de révocation (si l'utilisateur retire son consentement)
            $table->timestamp('revoked_at')->nullable();

            $table->timestamps();

            // Clé étrangère vers users
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_consents');
    }
};