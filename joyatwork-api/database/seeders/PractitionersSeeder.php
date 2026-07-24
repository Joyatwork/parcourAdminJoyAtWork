<?php

namespace Database\Seeders;

use App\Models\PraticienCertifications;
use App\Models\PraticienDiplomes;
use App\Models\Practitioner;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PractitionersSeeder extends Seeder
{
    public function run(): void
    {
        $profiles = [
            $this->profile('Marie', 'Dubois', 'Psychologue du travail', 'Paris', '75002', 80, 120, 12, 4.9,
                ['Burn-out', 'Risques psychosociaux', 'QVT'], ['Français', 'Anglais']),
            $this->profile('Julien', 'Moreau', 'Coach bien-être', 'Lyon', '69003', 70, 100, 9, 4.7,
                ['Gestion du stress', 'Coaching individuel', 'Équilibre de vie'], ['Français']),
            $this->profile('Amélie', 'Laurent', 'Sophrologue', 'Nantes', '44000', 60, 90, 8, 4.8,
                ['Sommeil', 'Relaxation', 'Gestion des émotions'], ['Français', 'Espagnol']),
            $this->profile('Pierre', 'Martin', 'Médecin du travail', 'Lille', '59000', 100, 160, 15, 4.9,
                ['Prévention santé', 'TMS', 'Maintien dans l’emploi'], ['Français', 'Anglais']),
            $this->profile('Sophie', 'Petit', 'Ergonome', 'Toulouse', '31000', 75, 110, 10, 4.6,
                ['Ergonomie', 'Posture', 'Aménagement du poste'], ['Français']),
            $this->profile('Alexandre', 'Girard', 'Psychothérapeute', 'Strasbourg', '67000', 85, 130, 11, 4.8,
                ['Anxiété', 'Traumatismes', 'Transitions professionnelles'], ['Français', 'Allemand']),
            $this->profile('Claire', 'Bernard', 'Naturopathe', 'Bordeaux', '33000', 65, 95, 7, 4.6,
                ['Nutrition', 'Naturopathie', 'Gestion du stress'], ['Français', 'Anglais']),
            $this->profile('Julie', 'Fontaine', 'Kinésithérapeute', 'Marseille', '13006', 55, 80, 9, 4.7,
                ['Rééducation', 'Posture', 'Prévention des TMS'], ['Français']),
            $this->profile('Thomas', 'Leroy', 'Coach sportif', 'Nice', '06000', 60, 90, 8, 4.8,
                ['Coaching sportif', 'Préparation mentale', 'Santé au travail'], ['Français', 'Anglais']),
        ];

        foreach ($profiles as $index => $data) {
            $email = Str::slug($data['first_name'], '').'.'.Str::slug($data['last_name'], '').'@praticiens.joyatwork.fr';
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $data['first_name'].' '.$data['last_name'],
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'phone' => $data['phone'],
                    'password' => Hash::make('PraticienDemo2026!'),
                    'is_active' => true,
                ]
            );

            // Réutilise les anciennes fiches incomplètes plutôt que de créer des doublons.
            $practitioner = Practitioner::query()
                ->where('first_name', $data['first_name'])
                ->where('last_name', $data['last_name'])
                ->orderBy('id')
                ->first();
            $duplicate = Practitioner::query()->where('email', $email)->first();

            if ($practitioner && $duplicate && $duplicate->id !== $practitioner->id) {
                PraticienDiplomes::query()->where('praticien_id', $duplicate->id)->delete();
                PraticienCertifications::query()->where('praticien_id', $duplicate->id)->delete();
                $duplicate->delete();
            }

            $values = array_merge($data, [
                    'email' => $email,
                    'user_id' => $user->id,
                    'is_verified' => $index !== 5,
                    'verified_at' => $index !== 5 ? now()->subDays(30 - $index) : null,
                    'verified_by' => $index !== 5 ? User::query()->value('id') : null,
                    'status' => 'active',
                    'accepts_new_patients' => $index !== 3,
                    'emergency_consultations' => in_array($index, [1, 3], true),
                    'certif_iprp_path' => $index === 0 ? '/storage/praticiens/demo/certificat-iprp-marie-dubois.pdf' : null,
                    'certif_iprp_verified' => $index === 0,
                ]);

            if ($practitioner) {
                $practitioner->update($values);
            } else {
                $practitioner = Practitioner::create($values);
            }

            $this->seedDocuments($practitioner, $index);
        }
    }

    private function profile(
        string $firstName,
        string $lastName,
        string $speciality,
        string $city,
        string $postalCode,
        int $minPrice,
        int $maxPrice,
        int $experience,
        float $rating,
        array $specializations,
        array $languages
    ): array {
        $slug = Str::slug($firstName.' '.$lastName);
        $phoneSuffix = substr($postalCode, 0, 2);

        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'speciality' => $speciality,
            'phone' => '+33 6 20 26 '.$phoneSuffix.' '.str_pad((string) ($experience * 3), 2, '0', STR_PAD_LEFT),
            'country' => 'France',
            'city' => $city,
            'postal_code' => $postalCode,
            'address' => (10 + $experience).' rue de la Santé',
            'consultation_mode' => in_array($speciality, ['Médecin du travail', 'Ergonome'], true) ? 'presentiel' : 'both',
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
            'website' => 'https://'.$slug.'.example.fr',
            'linkedin' => 'https://www.linkedin.com/in/'.$slug,
            'rpps_number' => '10'.$postalCode.str_pad((string) $experience, 4, '0', STR_PAD_LEFT),
            'siret_number' => '921'.$postalCode.str_pad((string) $experience, 6, '0', STR_PAD_LEFT),
            'payment_methods' => ['Carte bancaire', 'Virement'],
            'availability' => $experience % 2 === 0 ? 'Lun–Ven, 09:00–18:00' : 'Lun–Jeu, 08:30–19:00',
            'languages' => $languages,
            'specializations' => $specializations,
            'bio' => $firstName.' accompagne les salariés et les entreprises en '.$speciality
                .' avec une approche personnalisée, confidentielle et orientée vers des résultats durables.',
            'avatar_url' => null,
            'experience_years' => $experience,
            'rating' => $rating,
            'certifications' => implode(', ', $specializations),
        ];
    }

    private function seedDocuments(Practitioner $practitioner, int $index): void
    {
        $diplomas = [
            'Diplôme d’État – '.$practitioner->speciality,
            'Formation universitaire en santé au travail',
        ];

        foreach ($diplomas as $position => $name) {
            PraticienDiplomes::updateOrCreate(
                ['praticien_id' => $practitioner->id, 'nom' => $name],
                [
                    'chemin_fichier' => '/storage/praticiens/demo/diplome-'.$practitioner->id.'-'.($position + 1).'.pdf',
                    'verifie' => !($index === 5 && $position === 1),
                ]
            );
        }

        foreach (['Prévention des RPS', 'Écoute et accompagnement professionnel'] as $position => $name) {
            PraticienCertifications::updateOrCreate(
                ['praticien_id' => $practitioner->id, 'nom' => $name],
                [
                    'chemin_fichier' => '/storage/praticiens/demo/certification-'.$practitioner->id.'-'.($position + 1).'.pdf',
                    'verifie' => $position === 0 || $index < 4,
                ]
            );
        }
    }
}
