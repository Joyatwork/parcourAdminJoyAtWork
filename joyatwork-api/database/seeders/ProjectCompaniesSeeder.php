<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class ProjectCompaniesSeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            ['JoyAtWork', 'joyatwork.com', '12 rue de la Santé', '75002', 'Paris', 'France', 'SAS', 'Bien-être au travail', 'contact@joyatwork.com', '+33 1 23 45 67 89', 45, 'Plateforme dédiée au bien-être et à la qualité de vie au travail.'],
            ['TechCorp Solutions', 'techcorp.com', '200 Innovation Drive', '94043', 'Mountain View', 'États-Unis', 'LLC', 'Logiciels et services informatiques', 'raje@techcorp.com', '+1 650 555 0199', 320, 'Fournisseur de solutions logicielles pour les entreprises.'],
            ['BioHealth Industries', 'biohealth.com', '55 Biotech Park', '10115', 'Berlin', 'Allemagne', 'GmbH', 'Santé et biotechnologie', 'anna.mueller@biohealth.com', '+49 30 1234567', 250, 'Entreprise spécialisée dans les solutions biotechnologiques appliquées à la santé.'],
            ['Green Energy Co', 'greenenergy.co', '9 Renewable Avenue', '1000', 'Bruxelles', 'Belgique', 'SA', 'Énergies renouvelables', 'info@greenenergy.co', '+32 2 555 0101', 120, 'Producteur et opérateur de solutions énergétiques renouvelables.'],
            ['FinanceFirst Group', 'financefirst.com', '1 Finance Square', '10001', 'New York', 'États-Unis', 'Inc.', 'Finance', 'monica.reyes@financefirst.com', '+1 212 555 0144', 540, 'Groupe de services financiers et de conseil en investissement.'],
            ['EduTech Innovation', 'edutech.io', '88 rue de la Formation', '75011', 'Paris', 'France', 'SARL', 'Technologies éducatives', 'contact@edutech.io', '+33 1 98 76 54 32', 60, 'Solutions de formation numérique pour entreprises et établissements.'],
            ['LogiTrans Global', 'logitrans.global', '45 Harbor Road', '28013', 'Madrid', 'Espagne', 'SA', 'Transport et logistique', 'c.alvarez@logitrans.global', '+34 91 555 1212', 410, 'Opérateur logistique international spécialisé dans les flux professionnels.'],
            ['WellBeing Solutions', 'wellbeing.io', '3 Wellness Plaza', '4000', 'Liège', 'Belgique', 'SRL', 'Santé au travail', 'elisa@wellbeing.io', '+32 4 555 2323', 85, 'Conception et déploiement de programmes de bien-être en entreprise.'],
            ['Food & Care', 'foodandcare.com', '77 Market Street', '2000', 'Anvers', 'Belgique', 'SRL', 'Agroalimentaire', 'marie.leclerc@foodandcare.com', '+32 3 555 0100', 210, 'Fabricant et distributeur de produits alimentaires.'],
            ['SecureIT Services', 'secureit.services', '10 Cybersecurity Lane', '4000', 'Liège', 'Belgique', 'SRL', 'Cybersécurité', 'olivier@secureit.services', '+32 4 555 4545', 130, 'Services de sécurité informatique pour PME et grandes entreprises.'],
            ['MindfulCorp', 'mindfulcorp.com', '24 quai du Rhône', '69002', 'Lyon', 'France', 'SAS', 'Conseil QVCT', 'contact@mindfulcorp.com', '+33 4 72 00 10 20', 75, 'Cabinet de conseil en qualité de vie et conditions de travail.'],
            ['JoyAtWork France', 'joyatwork.fr', '18 avenue de la République', '75011', 'Paris', 'France', 'SAS', 'Bien-être au travail', 'france@joyatwork.com', '+33 1 84 80 20 26', 32, 'Entité française du réseau JoyAtWork.'],
            ['joyat', 'joyat.local', '5 rue des Ateliers', '75012', 'Paris', 'France', 'SAS', 'Services numériques', 'contact@joyat.local', '+33 1 80 00 00 13', 18, 'Environnement interne utilisé pour les services numériques du projet.'],
            ['Nouveau nom', 'nouveaunom.com', '16 rue de la Création', '33000', 'Bordeaux', 'France', 'SARL', 'Conseil', 'contact@nouveaunom.com', '+33 5 56 00 00 14', 25, 'Entreprise de conseil référencée dans le jeu de données initial.'],
            ['HealthyWork Labs', 'healthyworklabs.com', '8 rue Pasteur', '34000', 'Montpellier', 'France', 'SAS', 'Innovation en santé au travail', 'contact@healthyworklabs.com', '+33 4 67 00 00 15', 48, 'Laboratoire de solutions innovantes pour la santé au travail.'],
            ['UrbanMind Consulting', 'urbanmind.consulting', '30 cours Lafayette', '69003', 'Lyon', 'France', 'SAS', 'Conseil et accompagnement', 'contact@urbanmind.consulting', '+33 4 72 00 00 16', 55, 'Cabinet de conseil spécialisé dans l’accompagnement des organisations.'],
            ['blueocean-tech.com', 'blueocean-tech.com', '12 boulevard de l’Innovation', '44000', 'Nantes', 'France', 'SAS', 'Technologies numériques', 'contact@blueocean-tech.com', '+33 2 40 00 00 17', 90, 'Entreprise technologique orientée solutions cloud et collaboration.'],
            ['mountaincare-group.fr', 'mountaincare-group.fr', '7 avenue des Alpes', '38000', 'Grenoble', 'France', 'SAS', 'Santé et prévention', 'contact@mountaincare-group.fr', '+33 4 76 00 00 18', 115, 'Groupe de services de santé, de prévention et d’accompagnement.'],
            ['cityhr-partners.fr', 'cityhr-partners.fr', '22 rue du Travail', '59000', 'Lille', 'France', 'SARL', 'Ressources humaines', 'contact@cityhr-partners.fr', '+33 3 20 00 00 19', 42, 'Cabinet partenaire spécialisé en ressources humaines et QVCT.'],
            ['globalcare-alliance.org', 'globalcare-alliance.org', '40 avenue de l’Europe', '67000', 'Strasbourg', 'France', 'Association', 'Santé et action sociale', 'contact@globalcare-alliance.org', '+33 3 88 00 00 20', 68, 'Réseau d’acteurs de la santé et de l’accompagnement social.'],
        ];

        $existing = Company::query()->orderBy('id')->get();

        foreach ($companies as $index => $row) {
            [$name, $domain, $address, $postalCode, $city, $country, $legalForm, $sector, $email, $phone, $employees, $description] = $row;
            $values = [
                'name' => $name,
                'domain' => $domain,
                'is_active' => true,
                'adresse_facturation' => $address,
                'code_postal' => $postalCode,
                'ville' => $city,
                'pays' => $country,
                // Ces sociétés appartiennent au jeu de données projet : aucun identifiant légal non vérifié.
                'siret' => null,
                'numero_tva' => null,
                'forme_juridique' => $legalForm,
                'contact_principal' => 'Service ressources humaines',
                'email_contact' => $email,
                'telephone_contact' => $phone,
                'nombre_employes' => $employees,
                'secteur_activite' => $sector,
                'site_web' => 'https://'.$domain,
                'description' => $description,
                'date_premier_contact' => now()->subMonths(6 + $index)->toDateString(),
                'source_lead' => 'Données projet',
            ];

            if (isset($existing[$index])) {
                $existing[$index]->update($values);
            } else {
                Company::create($values);
            }
        }
    }
}
