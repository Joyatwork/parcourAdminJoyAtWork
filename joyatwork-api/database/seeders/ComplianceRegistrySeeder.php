<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ComplianceRegistry;

class ComplianceRegistrySeeder extends Seeder
{
    public function run()
    {
        $examples = [
            [
                'name' => 'Registre des traitements - Utilisateurs',
                'purpose' => 'Gestion des comptes et authentification',
                'data_type' => 'Identifiants, email, nom',
                'retention_period' => '5 years'
            ],
            [
                'name' => 'Registre des traitements - Diagnostics',
                'purpose' => 'Collecte de diagnostics de santé anonymisés',
                'data_type' => 'Réponses anonymisées, métriques',
                'retention_period' => '3 years'
            ]
        ];

        foreach ($examples as $row) {
            ComplianceRegistry::create($row);
        }
    }
}
