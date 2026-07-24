<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\LibraryContent;
use App\Models\Practitioner;
use Illuminate\Database\Seeder;

class LibraryContentsSeeder extends Seeder
{
    public function run(): void
    {
        LibraryContent::query()->where('title', 'Étirements doux au bureau')
            ->update(['title' => 'Un peu de stress, ça ne fait pas de mal ?']);
        LibraryContent::query()->where('title', 'Manager avec reconnaissance')
            ->update(['title' => 'Contre le stress, on ne peut rien ?']);

        $companyNames = Company::query()->orderBy('id')->limit(4)->pluck('name')->all();
        $practitionerNames = Practitioner::query()->orderBy('id')->limit(3)->get()
            ->map(fn ($p) => trim($p->first_name.' '.$p->last_name))->values();

        $contents = [
            ['Respiration guidée anti-stress', 'meditation', 'audio', 6, ['stress', 'émotion'], ['respiration', 'pause', 'calme'], 'all', 'léger', 'novice', 1480, 91, 4.8, ['Pause express', 'Gestion du stress']],
            ['Comprendre les risques psychosociaux', 'video', 'video', 14, ['stress', 'travail'], ['RPS', 'prévention', 'management'], 'managers', 'modéré', 'novice', 960, 78, 4.6, ['Prévention RPS']],
            ['Guide pratique du sommeil réparateur', 'guide', 'pdf', 0, ['sommeil', 'bien-être'], ['sommeil', 'récupération', 'routine'], 'all', 'léger', 'novice', 1210, 84, 4.7, ['Sommeil et récupération']],
            ['Un peu de stress, ça ne fait pas de mal ?', 'video', 'video', 6, ['stress', 'travail'], ['prévention', 'idées reçues', 'RPS'], 'all', 'modéré', 'novice', 1875, 88, 4.9, ['Prévention RPS']],
            ['Construire une journée de travail soutenable', 'article', 'article', 8, ['focus', 'bien-être'], ['organisation', 'priorités', 'charge'], 'all', 'modéré', 'habitué', 740, 72, 4.4, ['Organisation durable']],
            ['Méditation de déconnexion', 'meditation', 'audio', 10, ['stress', 'sommeil'], ['déconnexion', 'soir', 'relaxation'], 'all', 'léger', 'novice', 1320, 93, 4.8, ['Sommeil et récupération']],
            ['Prévenir l’épuisement professionnel', 'article', 'pdf', 0, ['stress', 'énergie'], ['burn-out', 'signaux', 'prévention'], 'hr', 'intense', 'expert', 510, 69, 4.5, ['Prévention RPS']],
            ['Contre le stress, on ne peut rien ?', 'video', 'video', 6, ['stress', 'travail'], ['prévention collective', 'RPS', 'organisation'], 'managers', 'modéré', 'habitué', 685, 81, 4.7, ['Prévention RPS']],
            ['Routine focus en 25 minutes', 'tool', 'guide', 25, ['focus', 'énergie'], ['concentration', 'routine', 'priorités'], 'all', 'modéré', 'habitué', 1040, 86, 4.6, ['Organisation durable']],
            ['Conduire un entretien de soutien', 'guide', 'pdf', 0, ['relation', 'émotion'], ['écoute', 'entretien', 'orientation'], 'practitioners', 'intense', 'expert', 330, 77, 4.9, ['Ressources praticiens']],
            ['Défi collectif : semaine de la gratitude', 'challenge', 'interactive', 7, ['relation', 'bien-être'], ['gratitude', 'équipe', 'collectif'], 'all', 'léger', 'novice', 820, 74, 4.5, ['Collectif positif']],
            ['Auto-évaluation de la charge mentale', 'tool', 'interactive', 12, ['stress', 'focus'], ['diagnostic', 'charge mentale', 'prévention'], 'all', 'modéré', 'habitué', 905, 79, 4.6, ['Prévention RPS']],
            ['Animer une pause active en équipe', 'guide', 'pdf', 0, ['mouvement', 'relation'], ['animation', 'équipe', 'posture'], 'specific_companies', 'léger', 'novice', 280, 82, 4.7, ['Bouger au travail']],
            ['Podcast : retrouver de l’énergie', 'audio', 'audio', 18, ['énergie', 'bien-être'], ['podcast', 'fatigue', 'habitudes'], 'all', 'modéré', 'habitué', 0, 0, 0, ['Énergie durable']],
            ['Kit RH de prévention trimestrielle', 'guide', 'zip', 0, ['travail', 'stress'], ['RH', 'campagne', 'prévention'], 'hr', 'modéré', 'expert', 0, 0, 0, ['Prévention RPS']],
            ['Archives : bases de la relaxation', 'meditation', 'audio', 12, ['stress', 'bien-être'], ['relaxation', 'archive'], 'all', 'léger', 'novice', 460, 65, 4.1, ['Archives']],
        ];

        $resourceLinks = [
            'Respiration guidée anti-stress' => 'https://www.inrs.fr/media.html?refINRS=Anim-005',
            'Comprendre les risques psychosociaux' => 'https://www.youtube.com/watch?v=B9P9k7o8Nxg',
            'Guide pratique du sommeil réparateur' => 'https://www.santepubliquefrance.fr/content/download/121788/file/154241_1215.pdf',
            'Un peu de stress, ça ne fait pas de mal ?' => 'https://www.youtube.com/watch?v=qzJoEvX6fI8',
            'Construire une journée de travail soutenable' => 'https://www.anact.fr/referentiel-qualite-de-vie-et-des-conditions-de-travail',
            'Méditation de déconnexion' => 'https://www.inrs.fr/actualites/droit-a-la-deconnexion.html',
            'Prévenir l’épuisement professionnel' => 'https://www.inrs.fr/risques/epuisement-burnout/ce-qu-il-faut-retenir',
            'Contre le stress, on ne peut rien ?' => 'https://www.youtube.com/watch?v=nSJR7OMDv80',
            'Routine focus en 25 minutes' => 'https://www.anact.fr/referentiel-qualite-de-vie-et-des-conditions-de-travail',
            'Conduire un entretien de soutien' => 'https://www.anact.fr/sites/default/files/2024-04/boite-outils-animer-espaces-discussion.pdf',
            'Défi collectif : semaine de la gratitude' => 'https://bretagne.dreets.gouv.fr/Tout-savoir-sur-la-Qualite-de-vie-au-travail-en-moins-de-6-minutes',
            'Auto-évaluation de la charge mentale' => 'https://www.inrs.fr/publications/outils/faire-le-point-rps',
            'Animer une pause active en équipe' => 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite/reduire/reduire-le-temps-passe-assis',
            'Podcast : retrouver de l’énergie' => 'https://www.mangerbouger.fr/l-essentiel/les-recommandations-sur-l-alimentation-l-activite-physique-et-la-sedentarite',
            'Kit RH de prévention trimestrielle' => 'https://www.inrs.fr/dms/inrs/PDF/guide-outil-faire-le-point/guide-outil-faire-le-point.pdf',
            'Archives : bases de la relaxation' => 'https://www.inrs.fr/risques/psychosociaux/prevention',
        ];

        foreach ($contents as $index => $item) {
            [$title, $type, $format, $duration, $thematic, $tags, $visibility, $intensity, $level, $views, $completion, $rating, $collections] = $item;
            $status = match ($index) {
                13 => 'scheduled',
                14 => 'draft',
                15 => 'archived',
                default => 'published',
            };
            $author = $index % 5 === 1 && $practitionerNames->isNotEmpty()
                ? $practitionerNames[$index % $practitionerNames->count()]
                : 'Équipe éditoriale JoyAtWork';
            $resourceUrl = $resourceLinks[$title] ?? null;
            $youtubeId = $resourceUrl && str_contains($resourceUrl, 'youtube.com/watch?v=')
                ? substr($resourceUrl, -11)
                : null;

            LibraryContent::updateOrCreate(
                ['title' => $title],
                [
                    'description' => $this->descriptionFor($title, $type),
                    'type' => $type,
                    'format' => $format,
                    'duration' => $duration,
                    'thematic' => $thematic,
                    'tags' => array_map(fn ($tag) => '#'.str_replace(' ', '', $tag), $tags),
                    'status' => $status,
                    'language' => 'fr',
                    'visibility' => $visibility,
                    'intensity' => $intensity,
                    'level' => $level,
                    'author' => $author,
                    'published_at' => $status === 'published' ? now()->subDays(10 + $index * 3) : null,
                    'scheduled_at' => $status === 'scheduled' ? now()->addDays(10) : null,
                    'thumbnail' => $youtubeId ? 'https://img.youtube.com/vi/'.$youtubeId.'/hqdefault.jpg' : null,
                    'file_url' => $resourceUrl,
                    'annex_files' => [],
                    'companies' => $visibility === 'specific_companies' ? $companyNames : [],
                    'practitioner_only' => $visibility === 'practitioners',
                    'views' => $views,
                    'completion_rate' => $completion,
                    'average_watch_time' => $duration > 0 && $completion > 0 ? max(1, (int) round($duration * $completion / 100)) : null,
                    'rating' => $rating ?: null,
                    'feedback' => $rating ? [[
                        'userId' => 'anonyme',
                        'rating' => $rating,
                        'comment' => 'Contenu clair et directement applicable.',
                        'date' => now()->subDays(3)->toIso8601String(),
                    ]] : [],
                    'collections' => $collections,
                    'is_pinned' => in_array($index, [0, 2, 3], true),
                    'is_hot_content' => $views >= 1200,
                    'has_quiz' => in_array($type, ['article', 'video', 'tool'], true),
                    'practitioner_guide' => null,
                    'customization' => [
                        'visualTheme' => $index % 2 === 0 ? 'apaisant' : 'dynamique',
                        'audioAmbient' => $type === 'meditation' ? 'nature' : 'aucun',
                    ],
                    'keywords' => array_values(array_unique(array_merge($thematic, $tags))),
                    'search_boost' => in_array($index, [0, 2, 3], true) ? 100 : 20,
                ]
            );
        }
    }

    private function descriptionFor(string $title, string $type): string
    {
        return match ($type) {
            'meditation' => $title.' propose une pratique guidée, courte et accessible à intégrer dans la journée de travail.',
            'video' => $title.' présente des repères concrets et des exercices applicables en situation professionnelle.',
            'audio' => $title.' offre un temps d’écoute pour comprendre ses besoins et installer de nouvelles habitudes.',
            'challenge' => $title.' transforme un objectif de bien-être en actions simples à réaliser avec son équipe.',
            'tool' => $title.' fournit une méthode structurée pour passer rapidement de l’observation à l’action.',
            default => $title.' rassemble des conseils pratiques, des exemples et une méthode progressive pour agir au quotidien.',
        };
    }
}
