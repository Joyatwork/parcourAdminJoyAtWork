<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;
use Carbon\Carbon;

class ContractsSeeder extends Seeder
{
    public function run()
    {
        $companies = Company::all();
        foreach ($companies as $company) {
            DB::table('contracts')->insert([
                'entreprise_id' => $company->id,
                'title' => 'Contrat cadre - ' . $company->name,
                'start_date' => Carbon::now()->subMonths(rand(1,24))->toDateString(),
                'end_date' => Carbon::now()->addMonths(rand(6,36))->toDateString(),
                'status' => 'active',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
