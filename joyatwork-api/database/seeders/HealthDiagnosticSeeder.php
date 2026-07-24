<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Diagnostic;
use App\Models\QuestionnaireTemplate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HealthDiagnosticSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->orderBy('id')->limit(3)->get();

        if ($companies->isEmpty()) {
            $this->command?->warn('Aucune entreprise disponible : données Santé & Diagnostic ignorées.');
            return;
        }

        $profiles = [
            ['first_name' => 'Sophie', 'last_name' => 'Martin', 'email' => 'sophie.martin@demo.joyatwork.fr'],
            ['first_name' => 'Thomas', 'last_name' => 'Bernard', 'email' => 'thomas.bernard@demo.joyatwork.fr'],
            ['first_name' => 'Nadia', 'last_name' => 'Diallo', 'email' => 'nadia.diallo@demo.joyatwork.fr'],
            ['first_name' => 'Julien', 'last_name' => 'Moreau', 'email' => 'julien.moreau@demo.joyatwork.fr'],
        ];

        $users = collect($profiles)->map(function (array $profile, int $index) use ($companies) {
            $company = $companies[$index % $companies->count()];

            return User::updateOrCreate(
                ['email' => $profile['email']],
                [
                    'name' => $profile['first_name'].' '.$profile['last_name'],
                    'first_name' => $profile['first_name'],
                    'last_name' => $profile['last_name'],
                    'entreprise_id' => $company->id,
                    'password' => Hash::make('DemoJoyatwork2026!'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]
            );
        });

        $this->seedQuestionnaires();

        // Rend le seeder relançable sans créer de doublons.
        Diagnostic::query()->where('scope', 'healthdemo')->delete();

        $months = collect(range(3, 0))->map(fn (int $offset) => now()->startOfMonth()->subMonths($offset));

        foreach ($months as $monthIndex => $period) {
            foreach ($users as $userIndex => $user) {
                $this->createDiagnostic(
                    user: $user,
                    companyId: (int) $user->entreprise_id,
                    period: $period,
                    type: 'user_diagnostic',
                    seed: $userIndex + ($monthIndex * 2)
                );
            }

            foreach ($companies as $companyIndex => $company) {
                $owner = $users->firstWhere('entreprise_id', $company->id) ?? $users->first();
                $this->createDiagnostic(
                    user: $owner,
                    companyId: (int) $company->id,
                    period: $period,
                    type: 'company_diagnostic',
                    seed: $companyIndex + $monthIndex + 1
                );
            }
        }
    }

    private function seedQuestionnaires(): void
    {
        $templates = [
            [
                'name' => 'Baromètre bien-être mensuel',
                'description' => 'Mesure rapide de l’énergie, du stress, du sommeil et de la satisfaction au travail.',
                'archived' => false,
                'usage_count' => 48,
                'sections' => [
                    $this->section('bien-etre', 'Bien-être général', [
                        $this->rating('energie', 'Quel est votre niveau d’énergie aujourd’hui ?'),
                        $this->rating('humeur', 'Comment évaluez-vous votre humeur générale ?'),
                        $this->rating('sommeil', 'Comment évaluez-vous la qualité de votre sommeil ?'),
                    ]),
                    $this->section('travail', 'Conditions de travail', [
                        $this->rating('stress', 'Quel est votre niveau de stress au travail ?'),
                        $this->rating('pression', 'Quelle pression ressentez-vous dans votre activité ?'),
                        $this->rating('satisfaction', 'Êtes-vous satisfait(e) de votre travail actuel ?'),
                    ]),
                ],
            ],
            [
                'name' => 'Prévention des risques psychosociaux',
                'description' => 'Repère les principaux signaux de surcharge, d’isolement et de perte de motivation.',
                'archived' => false,
                'usage_count' => 31,
                'sections' => [
                    $this->section('charge', 'Charge et organisation', [
                        $this->rating('charge-travail', 'Ma charge de travail est soutenable.'),
                        $this->rating('priorites', 'Mes priorités sont clairement définies.'),
                        $this->rating('deconnexion', 'Je parviens à déconnecter après ma journée.'),
                    ]),
                    $this->section('collectif', 'Soutien et relations', [
                        $this->rating('manager', 'Je peux solliciter mon manager en cas de difficulté.'),
                        $this->rating('equipe', 'Je me sens soutenu(e) par mon équipe.'),
                        $this->choice('alerte', 'Souhaitez-vous être recontacté(e) ?', ['Oui', 'Non']),
                    ]),
                ],
            ],
            [
                'name' => 'Qualité de vie et conditions de travail',
                'description' => 'Questionnaire trimestriel sur l’environnement, l’autonomie et l’équilibre de vie.',
                'archived' => false,
                'usage_count' => 22,
                'sections' => [
                    $this->section('qvct', 'Expérience collaborateur', [
                        $this->rating('autonomie', 'Je dispose d’une autonomie suffisante.'),
                        $this->rating('reconnaissance', 'Mon travail est reconnu à sa juste valeur.'),
                        $this->rating('equilibre', 'Mon équilibre vie professionnelle/vie personnelle est satisfaisant.'),
                        $this->text('suggestion', 'Quelle amélioration serait prioritaire pour vous ?'),
                    ]),
                ],
            ],
            [
                'name' => 'Bilan bien-être 2025',
                'description' => 'Ancienne version annuelle conservée à des fins d’historique.',
                'archived' => true,
                'usage_count' => 76,
                'sections' => [
                    $this->section('bilan', 'Bilan annuel', [
                        $this->rating('bilan-score', 'Comment évaluez-vous votre année professionnelle ?'),
                    ]),
                ],
            ],
        ];

        foreach ($templates as $template) {
            QuestionnaireTemplate::updateOrCreate(
                ['name' => $template['name']],
                array_merge($template, [
                    'created_by_name' => 'Équipe RH Joyatwork',
                    'created_by_user_id' => User::query()->value('id'),
                ])
            );
        }
    }

    private function createDiagnostic(User $user, int $companyId, Carbon $period, string $type, int $seed): void
    {
        $energy = min(10, 6 + ($seed % 4));
        $stress = min(10, 3 + ($seed % 5));
        $sleep = min(10, 5 + (($seed + 2) % 5));
        $mood = min(10, 6 + (($seed + 1) % 4));
        $pressure = min(10, 3 + (($seed + 3) % 5));

        Diagnostic::create([
            'user_id' => $user->id,
            'scope' => 'healthdemo',
            'stress_level' => $stress,
            'energy_level' => $energy,
            'work_pressure' => $pressure,
            'answers' => [
                'creation_type' => $type,
                'company_id' => $companyId,
                'questionnaire' => $type === 'company_diagnostic'
                    ? 'Baromètre collectif mensuel'
                    : 'Baromètre bien-être mensuel',
                'period' => $period->format('Y-m'),
                'avg_sleep' => $sleep,
                'avg_mood' => $mood,
                'seeded_demo' => true,
            ],
            'completed_at' => $period->copy()->day(min(18, 8 + $seed))->setTime(10, 0),
            'created_at' => $period->copy()->day(min(18, 8 + $seed))->setTime(10, 0),
            'updated_at' => $period->copy()->day(min(18, 8 + $seed))->setTime(10, 0),
        ]);
    }

    private function section(string $id, string $title, array $questions): array
    {
        return compact('id', 'title', 'questions');
    }

    private function rating(string $id, string $label): array
    {
        return ['id' => $id, 'label' => $label, 'type' => 'rating', 'maxScore' => 10, 'required' => true, 'options' => []];
    }

    private function text(string $id, string $label): array
    {
        return ['id' => $id, 'label' => $label, 'type' => 'text', 'maxScore' => 0, 'required' => false, 'options' => []];
    }

    private function choice(string $id, string $label, array $options): array
    {
        return ['id' => $id, 'label' => $label, 'type' => 'single_choice', 'maxScore' => 10, 'required' => true, 'options' => $options];
    }
}
