<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Database\Seeders\CGUSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminEmail = env('SEED_ADMIN_EMAIL');
        $adminPassword = env('SEED_ADMIN_PASSWORD');

        if ($adminEmail && $adminPassword) {
            User::updateOrCreate(
                ['email' => $adminEmail],
                [
                    'name' => env('SEED_ADMIN_NAME', 'Administrateur'),
                    'first_name' => env('SEED_ADMIN_FIRST_NAME', 'Admin'),
                    'last_name' => env('SEED_ADMIN_LAST_NAME', 'JoyAtWork'),
                    'password' => Hash::make($adminPassword),
                    'email_verified_at' => now(),
                ]
            );
        }
        // Seed CGU and RGPD logs
        $this->call([
            CGUSeeder::class,
            \Database\Seeders\CompaniesSeeder::class,
            \Database\Seeders\ProjectCompaniesSeeder::class,
            \Database\Seeders\ProjectContractsSeeder::class,
            \Database\Seeders\HealthDiagnosticSeeder::class,
            \Database\Seeders\PractitionersSeeder::class,
            \Database\Seeders\BillingWalletSeeder::class,
            \Database\Seeders\ChallengesSeeder::class,
            \Database\Seeders\LibraryContentsSeeder::class,
        ]);
    }
}
