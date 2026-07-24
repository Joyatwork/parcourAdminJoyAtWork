<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contracts')) {
            Schema::table('contracts', function (Blueprint $table) {
                if (!Schema::hasColumn('contracts', 'numero_contrat')) {
                    $table->string('numero_contrat')->nullable()->after('entreprise_id');
                }
                if (!Schema::hasColumn('contracts', 'type_contrat')) {
                    $table->string('type_contrat')->nullable()->after('numero_contrat');
                }
                if (!Schema::hasColumn('contracts', 'statut')) {
                    $table->string('statut')->nullable()->after('type_contrat');
                }
                if (!Schema::hasColumn('contracts', 'date_debut')) {
                    $table->date('date_debut')->nullable()->after('statut');
                }
                if (!Schema::hasColumn('contracts', 'date_fin')) {
                    $table->date('date_fin')->nullable()->after('date_debut');
                }
                if (!Schema::hasColumn('contracts', 'date_signature')) {
                    $table->date('date_signature')->nullable()->after('date_fin');
                }
                if (!Schema::hasColumn('contracts', 'date_renouvellement')) {
                    $table->date('date_renouvellement')->nullable()->after('date_signature');
                }
                if (!Schema::hasColumn('contracts', 'montant_annuel')) {
                    $table->decimal('montant_annuel', 12, 2)->nullable()->after('date_renouvellement');
                }
                if (!Schema::hasColumn('contracts', 'montant_mensuel')) {
                    $table->decimal('montant_mensuel', 12, 2)->nullable()->after('montant_annuel');
                }
                if (!Schema::hasColumn('contracts', 'devise')) {
                    $table->string('devise', 3)->nullable()->after('montant_mensuel');
                }
                if (!Schema::hasColumn('contracts', 'description')) {
                    $table->text('description')->nullable()->after('devise');
                }
                if (!Schema::hasColumn('contracts', 'conditions_particulieres')) {
                    $table->text('conditions_particulieres')->nullable()->after('description');
                }
                if (!Schema::hasColumn('contracts', 'nombre_employes_couverts')) {
                    $table->integer('nombre_employes_couverts')->nullable()->default(0)->after('conditions_particulieres');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('contracts')) {
            Schema::table('contracts', function (Blueprint $table) {
                $cols = [
                    'numero_contrat','type_contrat','statut','date_debut','date_fin','date_signature','date_renouvellement',
                    'montant_annuel','montant_mensuel','devise','description','conditions_particulieres','nombre_employes_couverts'
                ];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('contracts', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
