<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Credit;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\OrderLine;
use App\Models\Payout;
use App\Models\PayoutLine;
use App\Models\Practitioner;
use App\Models\Usage;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BillingWalletSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->orderBy('id')->get();
        $practitioners = Practitioner::query()->orderBy('id')->get();

        if ($companies->isEmpty() || $practitioners->isEmpty()) {
            $this->command?->warn('Entreprises ou praticiens absents : Billing & Wallet ignoré.');
            return;
        }

        DB::transaction(function () use ($companies, $practitioners) {
            $seededUsages = collect();

            foreach ($companies as $index => $company) {
                $wallet = Wallet::updateOrCreate(
                    ['entreprise_id' => $company->id],
                    ['devise' => 'EUR', 'is_locked' => false]
                );

                $orderStatus = $index % 7 === 6 ? 'pending' : 'confirmed';
                $orderDate = now()->subDays(12 + $index)->toDateString();
                $order = Order::updateOrCreate(
                    ['numero_commande' => sprintf('CMD-%d-%03d', now()->year, $index + 1)],
                    [
                        'entreprise_id' => $company->id,
                        'statut' => $orderStatus,
                        'date_commande' => $orderDate,
                    ]
                );

                $consultationQuantity = 8 + ($index % 5) * 2;
                $workshopQuantity = 2 + ($index % 3);
                $consultationPrice = 90;
                $workshopPrice = 450;

                $consultationLine = $this->line($order, 'Consultation individuelle', $consultationQuantity, $consultationPrice, 30, 70);
                $workshopLine = $this->line($order, 'Atelier collectif QVCT', $workshopQuantity, $workshopPrice, 40, 60);

                $totalHt = ($consultationQuantity * $consultationPrice) + ($workshopQuantity * $workshopPrice);
                $order->update([
                    'montant_total_ht' => $totalHt,
                    'montant_total_ttc' => round($totalHt * 1.20, 2),
                ]);

                $consultationUsed = min($consultationQuantity, 2 + ($index % 4));
                $workshopUsed = min($workshopQuantity, 1 + ($index % 2));
                $consultationCredit = $this->credit($company->id, $consultationLine, $consultationQuantity, $consultationUsed);
                $workshopCredit = $this->credit($company->id, $workshopLine, $workshopQuantity, $workshopUsed);

                $practitioner = $practitioners[$index % $practitioners->count()];
                $secondPractitioner = $practitioners[($index + 3) % $practitioners->count()];
                $seededUsages->push($this->usage(
                    $company->id, $practitioner->id, $consultationLine, $consultationCredit,
                    'Consultation individuelle', $consultationPrice, 30, 70, 4 + $index
                ));
                $seededUsages->push($this->usage(
                    $company->id, $secondPractitioner->id, $workshopLine, $workshopCredit,
                    'Atelier collectif QVCT', $workshopPrice, 40, 60, 18 + $index
                ));

                $invoiceStatus = match ($index % 4) {
                    0, 1 => 'payee',
                    2 => 'envoyee',
                    default => 'a_emettre',
                };
                $invoice = Invoice::updateOrCreate(
                    ['numero_facture' => sprintf('FAC-%d-%03d', now()->year, $index + 1)],
                    [
                        'entreprise_id' => $company->id,
                        'type' => 'order',
                        'reference_type' => Order::class,
                        'reference_id' => $order->id,
                        'montant_ht' => $totalHt,
                        'montant_ttc' => round($totalHt * 1.20, 2),
                        'taux_tva' => 20,
                        'statut' => $invoiceStatus,
                        'date_emission' => $orderDate,
                        'due_date' => now()->subDays(12 + $index)->addDays(30)->toDateString(),
                        'paid_at' => $invoiceStatus === 'payee' ? now()->subDays(2 + $index) : null,
                    ]
                );

                $rechargeAmount = 3000 + (($index % 5) * 1000);
                $rechargeInvoice = Invoice::updateOrCreate(
                    ['numero_facture' => sprintf('RECH-%d-%03d', now()->year, $index + 1)],
                    [
                        'entreprise_id' => $company->id,
                        'type' => 'recharge',
                        'reference_type' => 'Recharge',
                        'reference_id' => $wallet->id,
                        'montant_ht' => $rechargeAmount,
                        'montant_ttc' => $rechargeAmount,
                        'taux_tva' => 0,
                        'statut' => 'payee',
                        'date_emission' => now()->subMonths(2)->addDays($index)->toDateString(),
                        'due_date' => now()->subMonth()->addDays($index)->toDateString(),
                        'paid_at' => now()->subMonths(2)->addDays($index + 2),
                    ]
                );

                $usageDebit = $consultationPrice + $workshopPrice;
                $wallet->update(['balance' => $rechargeAmount - $usageDebit]);
                $this->transaction($wallet, 'credit', $rechargeAmount, Invoice::class, $rechargeInvoice->id, 'Recharge du portefeuille');
                $this->transaction($wallet, 'debit', $usageDebit, Usage::class, null, 'Prestations consommées');
            }

            $this->seedPayouts($seededUsages, $practitioners);
        });
    }

    private function line(Order $order, string $service, int $quantity, float $price, float $joyPct, float $practitionerPct): OrderLine
    {
        return OrderLine::updateOrCreate(
            ['order_id' => $order->id, 'type_service' => $service],
            [
                'quantite' => $quantity,
                'prix_unitaire_ht' => $price,
                'montant_ligne_ht' => $quantity * $price,
                'part_joyatwork_pct' => $joyPct,
                'part_praticien_pct' => $practitionerPct,
            ]
        );
    }

    private function credit(int $companyId, OrderLine $line, int $initial, int $used): Credit
    {
        return Credit::updateOrCreate(
            ['order_line_id' => $line->id],
            [
                'entreprise_id' => $companyId,
                'type_service' => $line->type_service,
                'quantite_initiale' => $initial,
                'quantite_restante' => max(0, $initial - $used),
                'date_expiration' => now()->addYear()->toDateString(),
            ]
        );
    }

    private function usage(
        int $companyId,
        int $practitionerId,
        OrderLine $line,
        Credit $credit,
        string $service,
        float $price,
        float $joyPct,
        float $practitionerPct,
        int $daysAgo
    ): Usage {
        $date = now()->subDays($daysAgo)->toDateString();
        return Usage::updateOrCreate(
            [
                'entreprise_id' => $companyId,
                'order_line_id' => $line->id,
                'practitioner_id' => $practitionerId,
                'date_prestation' => $date,
            ],
            [
                'credit_id' => $credit->id,
                'employee_id' => null,
                'type_service' => $service,
                'prix_ht' => $price,
                'part_joyatwork_ht' => round($price * $joyPct / 100, 2),
                'part_praticien_ht' => round($price * $practitionerPct / 100, 2),
                'statut' => 'valide_auto',
                'validated_at' => now()->subDays($daysAgo)->setTime(18, 0),
            ]
        );
    }

    private function transaction(Wallet $wallet, string $type, float $amount, string $referenceType, ?int $referenceId, string $description): void
    {
        WalletTransaction::updateOrCreate(
            ['wallet_id' => $wallet->id, 'type' => $type, 'description' => $description],
            [
                'amount' => $amount,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
            ]
        );
    }

    private function seedPayouts($usages, $practitioners): void
    {
        foreach ($practitioners as $index => $practitioner) {
            $practitionerUsages = $usages->where('practitioner_id', $practitioner->id);
            if ($practitionerUsages->isEmpty()) continue;

            $status = $index % 3 === 0 ? 'calcule' : 'paye';
            $payout = Payout::updateOrCreate(
                [
                    'practitioner_id' => $practitioner->id,
                    'periode_debut' => now()->subMonths(3)->startOfMonth()->toDateString(),
                    'periode_fin' => now()->endOfMonth()->toDateString(),
                ],
                [
                    'montant_total_ht' => $practitionerUsages->sum(fn ($usage) => (float) $usage->part_praticien_ht),
                    'nombre_usages' => $practitionerUsages->count(),
                    'statut' => $status,
                    'paid_at' => $status === 'paye' ? now()->subDays(3 + $index) : null,
                ]
            );

            foreach ($practitionerUsages as $usage) {
                PayoutLine::updateOrCreate(
                    ['payout_id' => $payout->id, 'usage_id' => $usage->id],
                    ['montant_ht' => $usage->part_praticien_ht]
                );
            }
        }
    }
}
