<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $companies = [
            [
                'name' => 'TechCorp Solutions',
                'sector' => 'Technologie',
                'location' => 'Paris, France',
                'employees' => 250,
                'phone' => '+33142567890',
                'email' => 'contact@techcorp.fr',
                'website' => 'https://www.techcorp.fr',
                'description' => 'Entreprise leader en solutions digitales innovantes pour la transformation numérique des entreprises.',
                'wellness_programs' => ['Programme sport', 'Télétravail', 'Méditation', 'Formation bien-être'],
                'status' => 'Actif',
                'contract_value' => 45000.00,
                'verified' => true,
            ],
            [
                'name' => 'BioHealth Industries',
                'sector' => 'Santé',
                'location' => 'Lyon, France',
                'employees' => 180,
                'phone' => '+33478123456',
                'email' => 'rh@biohealth.fr',
                'website' => 'https://www.biohealth.fr',
                'description' => 'Spécialisée dans les biotechnologies médicales et la recherche pharmaceutique avancée.',
                'wellness_programs' => ['Checkup santé', 'Nutrition', 'Ergonomie', 'Soutien psychologique'],
                'status' => 'Actif',
                'contract_value' => 32000.00,
                'verified' => true,
            ],
            [
                'name' => 'Green Energy Co',
                'sector' => 'Énergie',
                'location' => 'Marseille, France',
                'employees' => 320,
                'phone' => '+33491567890',
                'email' => 'info@greenenergy.fr',
                'website' => 'https://www.greenenergy.fr',
                'description' => 'Solutions d\'énergies renouvelables et développement durable pour un avenir plus vert.',
                'wellness_programs' => ['Vélo électrique', 'Jardinage', 'Écologie', 'Sport nature'],
                'status' => 'Actif',
                'contract_value' => 67000.00,
                'verified' => true,
            ],
            [
                'name' => 'FinanceFirst Group',
                'sector' => 'Finance',
                'location' => 'La Défense, France',
                'employees' => 450,
                'phone' => '+33155789012',
                'email' => 'contact@financefirst.fr',
                'website' => 'https://www.financefirst.fr',
                'description' => 'Services financiers et conseil en investissement pour particuliers et entreprises.',
                'wellness_programs' => ['Gestion stress', 'Formation bien-être', 'Coaching', 'Relaxation'],
                'status' => 'Actif',
                'contract_value' => 89000.00,
                'verified' => true,
            ],
            [
                'name' => 'EduTech Innovation',
                'sector' => 'Éducation',
                'location' => 'Toulouse, France',
                'employees' => 95,
                'phone' => '+33561234567',
                'email' => 'hello@edutech.fr',
                'website' => 'https://www.edutech-innovation.fr',
                'description' => 'Plateformes d\'apprentissage numériques et solutions éducatives innovantes.',
                'wellness_programs' => ['Flexibilité horaire', 'Formation continue', 'Team building'],
                'status' => 'En négociation',
                'contract_value' => 25000.00,
                'verified' => true,
            ],
            [
                'name' => 'LogiFlow Systems',
                'sector' => 'Logistique',
                'location' => 'Lille, France',
                'employees' => 280,
                'phone' => '+33320456789',
                'email' => 'contact@logiflow.fr',
                'website' => 'https://www.logiflow-systems.fr',
                'description' => 'Solutions logistiques et supply chain pour optimiser les flux de marchandises.',
                'wellness_programs' => ['Sécurité au travail', 'Ergonomie postes', 'Prévention TMS'],
                'status' => 'Actif',
                'contract_value' => 54000.00,
                'verified' => true,
            ],
            [
                'name' => 'ArtCreative Studio',
                'sector' => 'Créatif',
                'location' => 'Bordeaux, France',
                'employees' => 65,
                'phone' => '+33556789012',
                'email' => 'studio@artcreative.fr',
                'website' => 'https://www.artcreative.fr',
                'description' => 'Agence créative spécialisée dans le design graphique et la communication visuelle.',
                'wellness_programs' => ['Ateliers créatifs', 'Pause bien-être', 'Inspiration'],
                'status' => 'Actif',
                'contract_value' => 18000.00,
                'verified' => true,
            ],
            [
                'name' => 'Manufacturing Plus',
                'sector' => 'Industrie',
                'location' => 'Strasbourg, France',
                'employees' => 420,
                'phone' => '+33388234567',
                'email' => 'contact@manufacturing-plus.fr',
                'website' => 'https://www.manufacturing-plus.fr',
                'description' => 'Fabrication industrielle et solutions d\'automatisation pour l\'industrie 4.0.',
                'wellness_programs' => ['Sécurité renforcée', 'Ergonomie', 'Prévention accidents'],
                'status' => 'Actif',
                'contract_value' => 75000.00,
                'verified' => true,
            ]
        ];

        foreach ($companies as $company) {
            Company::create($company);
        }
    }
}
