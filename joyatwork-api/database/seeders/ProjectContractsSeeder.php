<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Contract;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectContractsSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->orderBy('id')->get();
        $types = ['Standard', 'Premium', 'Enterprise'];

        DB::transaction(function () use ($companies, $types) {
            foreach ($companies as $index => $company) {
                $status = $this->statusFor($index);
                $type = $types[$index % count($types)];
                $coveredEmployees = max(1, min((int) ($company->nombre_employes ?: 25), 500));
                $rate = ['Standard' => 144, 'Premium' => 240, 'Enterprise' => 360][$type];
                $annualAmount = $coveredEmployees * $rate;

                [$startDate, $endDate, $signatureDate, $renewalDate] = $this->datesFor($status, $index);

                $existingContracts = Contract::query()
                    ->where('entreprise_id', $company->id)
                    ->orderBy('id')
                    ->get();
                $contract = $existingContracts->first() ?? new Contract(['entreprise_id' => $company->id]);

                // Les anciennes initialisations ont créé plusieurs contrats vides pour certaines sociétés.
                if ($existingContracts->count() > 1) {
                    Contract::query()
                        ->whereIn('id', $existingContracts->skip(1)->pluck('id'))
                        ->delete();
                }

                $contract->fill([
                    'entreprise_id' => $company->id,
                    'numero_contrat' => sprintf('JAW-%d-%03d', now()->year, $index + 1),
                    'type_contrat' => $type,
                    'statut' => $status,
                    'date_debut' => $startDate,
                    'date_fin' => $endDate,
                    'date_signature' => $signatureDate,
                    'date_renouvellement' => $renewalDate,
                    'montant_annuel' => $annualAmount,
                    'montant_mensuel' => round($annualAmount / 12, 2),
                    'devise' => 'EUR',
                    'description' => 'Accompagnement '.$type.' JoyAtWork pour '.$company->name.'.',
                    'conditions_particulieres' => $this->conditionsFor($type),
                    'nombre_employes_couverts' => $coveredEmployees,
                ]);
                $contract->save();

                // Maintient les anciennes colonnes compatibles avec les scripts historiques.
                DB::table('contracts')->where('id', $contract->id)->update([
                    'title' => 'Contrat cadre - '.$company->name,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate?->toDateString(),
                    'status' => match ($status) {
                        'Actif' => 'active',
                        'Expiré' => 'expired',
                        'Résilié' => 'terminated',
                        default => 'pending',
                    },
                ]);
            }
        });
    }

    private function statusFor(int $index): string
    {
        return match (true) {
            $index < 12 => 'Actif',
            $index < 15 => 'En négociation',
            $index < 17 => 'En attente signature',
            $index < 19 => 'Expiré',
            default => 'Résilié',
        };
    }

    private function datesFor(string $status, int $index): array
    {
        if ($status === 'Actif') {
            $start = now()->startOfDay()->subMonths(4 + ($index % 12));
            return [$start, $start->copy()->addYears(2), $start->copy()->subDays(14), $start->copy()->addYear()];
        }

        if (in_array($status, ['En négociation', 'En attente signature'], true)) {
            $start = now()->startOfDay()->addMonths(1 + ($index % 3));
            $signature = $status === 'En attente signature' ? null : null;
            return [$start, $start->copy()->addYears(2), $signature, $start->copy()->addYear()];
        }

        $end = now()->startOfDay()->subMonths(1 + ($index % 4));
        $start = $end->copy()->subYears(2);
        return [$start, $end, $start->copy()->subDays(10), null];
    }

    private function conditionsFor(string $type): string
    {
        return match ($type) {
            'Enterprise' => 'Pilotage trimestriel, reporting consolidé, interlocuteur dédié et accès complet aux programmes.',
            'Premium' => 'Bilan mensuel, ateliers collectifs et accès prioritaire au réseau de praticiens.',
            default => 'Accès à la plateforme, diagnostics périodiques et accompagnement standard.',
        };
    }
}
