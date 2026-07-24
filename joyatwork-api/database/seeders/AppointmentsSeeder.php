<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CompanyAppointment;
use App\Models\Company;
use Carbon\Carbon;

class AppointmentsSeeder extends Seeder
{
    public function run()
    {
        $companies = Company::all();
        foreach ($companies as $company) {
            // créer 1 à 2 RDV de démonstration par entreprise
            $count = rand(1,2);
            for ($i = 0; $i < $count; $i++) {
                CompanyAppointment::create([
                    'entreprise_id' => $company->id,
                    'scheduled_at' => Carbon::now()->addDays(rand(1,30))->toDateTimeString(),
                    'status' => 'scheduled',
                    'notes' => 'RDV de démonstration généré automatiquement',
                ]);
            }
        }
    }
}
