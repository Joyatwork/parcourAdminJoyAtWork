<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComplianceRegistry;
use App\Models\RgpdLog;
use Carbon\Carbon;

class CGUSeeder extends Seeder
{
    public function run()
    {
        ComplianceRegistry::create([
            'name' => "Conditions Générales d'Utilisation (CGU)",
            'purpose' => "Décrit les traitements réalisés par JOYATWORK : gestion des comptes, mise en relation Praticiens/Salariés, prise de rendez-vous, suivi de la santé et du bien-être via questionnaires et comptes-rendus.",
            'data_type' => "Nom, prénom, e-mail professionnel, numéro de téléphone, réponses aux questionnaires d'auto-diagnostic, données de rendez-vous et comptes-rendus fournis par les Praticiens.",
            'retention_period' => 'Conservation conforme aux finalités et à la réglementation (ex : 5 ans)'
        ]);

        RgpdLog::create([
            'action' => 'UPLOAD_CGU',
            'user_id' => null,
            'admin_email' => 'admin@joyatwork.test',
            'created_at' => Carbon::now()->subHours(2),
            'updated_at' => Carbon::now()->subHours(2),
        ]);

        RgpdLog::create([
            'action' => 'PUBLISH_CGU',
            'user_id' => null,
            'admin_email' => 'admin@joyatwork.test',
            'created_at' => Carbon::now()->subHour(),
            'updated_at' => Carbon::now()->subHour(),
        ]);
    }
}
