<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\ChallengeCitation;
use App\Models\ChallengeCitationTheme;
use App\Models\ChallengePack;
use App\Models\ChallengeUser;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChallengesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = $this->lookups('challenge_category', ['Sommeil', 'Énergie', 'Focus', 'Émotion', 'Relation', 'Mouvement']);
        $types = $this->lookups('challenge_type', ['Individuel', 'Collectif', 'Silencieux', 'Express']);
        $intensities = $this->lookups('challenge_intensity', ['Léger', 'Moyen', 'Engageant']);

        $packs = collect([
            ['Équilibre quotidien', 'Des habitudes simples pour retrouver énergie, calme et régularité.'],
            ['Concentration durable', 'Des défis pour protéger son attention et progresser sans surcharge.'],
            ['Collectif positif', 'Des actions concrètes pour renforcer l’écoute et la coopération.'],
            ['Bouger au travail', 'Une sélection accessible pour réduire la sédentarité au quotidien.'],
        ])->map(fn ($pack) => ChallengePack::updateOrCreate(['name' => $pack[0]], ['description' => $pack[1]]));

        $definitions = [
            ['Routine de sommeil 7 jours', 'Adopter une heure de coucher régulière pendant une semaine.', 'Sommeil', 'Individuel', 'Moyen', 120, '7 jours', 0],
            ['Pause écran avant le coucher', 'Éviter les écrans durant les trente minutes précédant le sommeil.', 'Sommeil', 'Express', 'Léger', 60, '5 jours', 0],
            ['Hydratation consciente', 'Boire régulièrement et suivre son hydratation pendant la journée.', 'Énergie', 'Individuel', 'Léger', 70, '7 jours', 0],
            ['Déconnexion de midi', 'Prendre une vraie pause déjeuner sans messagerie professionnelle.', 'Énergie', 'Silencieux', 'Moyen', 90, '5 jours', 0],
            ['Bloc de concentration', 'Réserver chaque jour vingt-cinq minutes à une seule tâche prioritaire.', 'Focus', 'Individuel', 'Moyen', 110, '10 jours', 1],
            ['Zéro notification', 'Désactiver les notifications non essentielles pendant deux heures.', 'Focus', 'Express', 'Léger', 50, '3 jours', 1],
            ['Respiration 4-6', 'Pratiquer cinq minutes de respiration lente deux fois par jour.', 'Émotion', 'Silencieux', 'Léger', 80, '7 jours', 0],
            ['Journal des réussites', 'Noter trois réussites ou moments positifs en fin de journée.', 'Émotion', 'Individuel', 'Moyen', 100, '10 jours', 0],
            ['Merci à un collègue', 'Exprimer chaque jour une reconnaissance précise à un membre de l’équipe.', 'Relation', 'Collectif', 'Léger', 90, '5 jours', 2],
            ['Café sans agenda', 'Organiser un échange informel de quinze minutes avec un collègue.', 'Relation', 'Collectif', 'Moyen', 100, '7 jours', 2],
            ['Marche active', 'Marcher au moins vingt minutes pendant la journée de travail.', 'Mouvement', 'Individuel', 'Moyen', 120, '14 jours', 3],
            ['Étirements au bureau', 'Réaliser trois courtes séquences d’étirements dans la journée.', 'Mouvement', 'Express', 'Léger', 70, '7 jours', 3],
            ['Semaine sans réunion tardive', 'Terminer toutes les réunions avant 17 h pour préserver la récupération.', 'Énergie', 'Collectif', 'Engageant', 180, '7 jours', 0],
            ['Challenge 5 000 pas', 'Atteindre collectivement une moyenne de cinq mille pas par jour.', 'Mouvement', 'Collectif', 'Engageant', 200, '21 jours', 3],
        ];

        $users = User::query()->where('is_active', true)->orderBy('id')->get();

        foreach ($definitions as $index => $item) {
            [$title, $description, $category, $type, $intensity, $points, $duration, $packIndex] = $item;
            $challenge = Challenge::updateOrCreate(
                ['title' => $title],
                [
                    'description' => $description,
                    'objective' => $description,
                    'category_id' => $categories[$category],
                    'type_id' => $types[$type],
                    'intensity_id' => $intensities[$intensity],
                    'points' => $points,
                    'duration' => $duration,
                    'is_active' => $index < 12,
                    'pack_id' => $packs[$packIndex]->id,
                    'pack_thematique' => $packs[$packIndex]->name,
                    'image_path' => null,
                    'video_path' => null,
                ]
            );

            $participantCount = min($users->count(), 3 + ($index % 6));
            foreach ($users->take($participantCount) as $userIndex => $user) {
                ChallengeUser::updateOrCreate(
                    ['challenge_id' => $challenge->id, 'user_id' => $user->id],
                    [
                        'employee_id' => null,
                        'score' => max(10, $points - ($userIndex * 10)),
                        'rate' => 3 + (($userIndex + $index) % 3),
                        'completed_at' => $userIndex % 3 === 0 ? null : now()->subDays($userIndex + $index),
                    ]
                );
            }

            $completed = ChallengeUser::query()->where('challenge_id', $challenge->id)->whereNotNull('completed_at')->count();
            $challenge->update([
                'participants' => $participantCount,
                'completion_rate' => $participantCount ? round($completed / $participantCount * 100, 2) : 0,
            ]);
        }

        $this->seedCitations();
    }

    private function lookups(string $table, array $names): array
    {
        $result = [];
        foreach ($names as $name) {
            $id = DB::table($table)->where('name', $name)->value('id');
            if (!$id) {
                $id = DB::table($table)->insertGetId(['name' => $name, 'created_at' => now(), 'updated_at' => now()]);
            }
            $result[$name] = $id;
        }
        return $result;
    }

    private function seedCitations(): void
    {
        $content = [
            'Énergie' => [
                ['Un petit geste répété devient une grande source d’énergie.', 'Encourage la régularité et les progrès accessibles.'],
                ['Préserver son énergie, c’est aussi apprendre à choisir ses priorités.', 'Aide à mieux répartir ses efforts.'],
            ],
            'Concentration' => [
                ['Une priorité claire vaut mieux que dix urgences concurrentes.', 'Favorise une attention plus stable.'],
                ['Le calme crée l’espace nécessaire au travail de qualité.', 'Invite à réduire les interruptions.'],
            ],
            'Sommeil' => [
                ['La récupération prépare silencieusement les réussites de demain.', 'Valorise le rôle du repos.'],
                ['Une soirée apaisée est le premier chapitre d’une bonne journée.', 'Encourage une routine de coucher saine.'],
            ],
            'Relations' => [
                ['Une équipe avance mieux quand chacun se sent écouté.', 'Renforce l’écoute et l’inclusion.'],
                ['La reconnaissance sincère transforme les efforts en engagement.', 'Développe une culture positive.'],
            ],
            'Mouvement' => [
                ['Chaque mouvement compte, même entre deux réunions.', 'Réduit la sédentarité sans objectif intimidant.'],
                ['Bouger quelques minutes peut changer le rythme de toute une journée.', 'Encourage les pauses actives.'],
            ],
            'Équilibre' => [
                ['La performance durable commence par un rythme que l’on peut tenir.', 'Prévient la surcharge dans la durée.'],
                ['S’accorder une pause, c’est donner une chance à la suite.', 'Déculpabilise les temps de récupération.'],
            ],
        ];

        foreach ($content as $themeName => $citations) {
            $theme = ChallengeCitationTheme::updateOrCreate(['theme' => $themeName]);
            foreach ($citations as [$quote, $benefit]) {
                ChallengeCitation::updateOrCreate(
                    ['theme_id' => $theme->id, 'citation' => $quote],
                    ['auteur' => 'Équipe JoyAtWork', 'benefice' => $benefit, 'musique_url' => null, 'video_url' => null]
                );
            }
        }
    }
}
