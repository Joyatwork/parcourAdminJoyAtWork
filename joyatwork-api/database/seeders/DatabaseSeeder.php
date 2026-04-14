<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
<<<<<<< HEAD
        User::updateOrCreate(
            ['email' => 'rachid.ouiz@hotmail.com'],
            [
                'name' => 'Rachid Ouiz',
                'first_name' => 'Rachid',
                'last_name' => 'Ouiz',
                'password' => Hash::make('rachidouiz'),
                'email_verified_at' => now(),
            ]
        );
=======
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        // On ajoute l'appel au nouveau seeder pour les filtres du Dashboard
    $this->call([
        KpiCompanyHealthSeeder::class,
    ]);
>>>>>>> 3157de8 (WIP : sauvegarde des modifications avant rebase sur dev)
    }
}
