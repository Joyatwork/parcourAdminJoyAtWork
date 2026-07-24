<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('entreprises')) {
            Schema::table('entreprises', function (Blueprint $table) {
                if (!Schema::hasColumn('entreprises', 'adresse_facturation')) {
                    $table->string('adresse_facturation')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'code_postal')) {
                    $table->string('code_postal')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'ville')) {
                    $table->string('ville')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'pays')) {
                    $table->string('pays')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'siret')) {
                    $table->string('siret')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'numero_tva')) {
                    $table->string('numero_tva')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'forme_juridique')) {
                    $table->string('forme_juridique')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'contact_principal')) {
                    $table->string('contact_principal')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'email_contact')) {
                    $table->string('email_contact')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'telephone_contact')) {
                    $table->string('telephone_contact')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'nombre_employes')) {
                    $table->integer('nombre_employes')->nullable()->default(0);
                }
                if (!Schema::hasColumn('entreprises', 'secteur_activite')) {
                    $table->string('secteur_activite')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'site_web')) {
                    $table->string('site_web')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'description')) {
                    $table->text('description')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'date_premier_contact')) {
                    $table->date('date_premier_contact')->nullable();
                }
                if (!Schema::hasColumn('entreprises', 'source_lead')) {
                    $table->string('source_lead')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('entreprises')) {
            Schema::table('entreprises', function (Blueprint $table) {
                $cols = [
                    'adresse_facturation', 'code_postal', 'ville', 'pays', 'siret',
                    'numero_tva', 'forme_juridique', 'contact_principal', 'email_contact',
                    'telephone_contact', 'nombre_employes', 'secteur_activite', 'site_web',
                    'description', 'date_premier_contact', 'source_lead'
                ];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('entreprises', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
