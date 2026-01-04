<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChallengeLookupsSeeder extends Seeder
{
    public function run(): void
    {
        // Challenge Categories
        DB::table('challenge_category')->insertOrIgnore([
            ['name' => 'Sommeil'],
            ['name' => 'Énergie'],
            ['name' => 'Focus'],
            ['name' => 'Émotion'],
            ['name' => 'Relation'],
            ['name' => 'Mouvement'],
        ]);

        // Challenge Types
        DB::table('challenge_type')->insertOrIgnore([
            ['name' => 'Individuel'],
            ['name' => 'Collectif'],
            ['name' => 'Silencieux'],
            ['name' => 'Express'],
        ]);

        // Challenge Intensities
        DB::table('challenge_intensity')->insertOrIgnore([
            ['name' => 'Léger'],
            ['name' => 'Moyen'],
            ['name' => 'Engageant'],
        ]);
    }
}
