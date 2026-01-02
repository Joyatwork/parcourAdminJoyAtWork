<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    /**
     * Générer des factures mensuelles à partir des contrats actifs.
     * Payload:
     * - year (int, required)
     * - month (int, required, 1-12)
     *
     * Règles simples :
     * - on prend les contrats avec statut Actif et dont la période couvre le mois cible
     * - on facture le montant_mensuel (ou montant_annuel/12) si présent
     * - on crée une facture de type 'order' (traçabilité) avec statut 'a_emettre'
     */
    public function generateMonthly(Request $request): JsonResponse
    {
        $data = $request->validate([
            'year' => ['required', 'integer', 'min:2000'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ]);

        $year = $data['year'];
        $month = $data['month'];

        $start = sprintf('%04d-%02d-01', $year, $month);
        $end = date('Y-m-t', strtotime($start));

        $created = DB::transaction(function () use ($start, $end, $year, $month) {
            $contrats = Contract::where('statut', 'Actif')
                ->whereDate('date_debut', '<=', $end)
                ->where(function ($q) use ($start) {
                    $q->whereNull('date_fin')
                      ->orWhere('date_fin', '>=', $start);
                })
                ->get();

            $invoices = [];

            foreach ($contrats as $contrat) {
                $montant = $contrat->montant_mensuel;
                if (is_null($montant) && !is_null($contrat->montant_annuel)) {
                    $montant = round($contrat->montant_annuel / 12, 2);
                }
                if (is_null($montant)) {
                    continue; // impossible de facturer si pas de montant
                }

                $invoices[] = Invoice::create([
                    'entreprise_id' => $contrat->entreprise_id ?? $contrat->entreprise_id ?? null,
                    'type' => 'order',
                    'reference_type' => Contract::class,
                    'reference_id' => $contrat->id,
                    'numero_facture' => 'INV-M-' . $year . sprintf('%02d', $month) . '-' . $contrat->id . '-' . rand(100, 999),
                    'montant_ht' => $montant,
                    'montant_ttc' => $montant, // TVA non gérée ici
                    'taux_tva' => 0,
                    'statut' => 'a_emettre',
                    'date_emission' => $start,
                    'due_date' => $end,
                ]);
            }

            return $invoices;
        });

        return response()->json([
            'generated' => count($created),
            'invoices' => $created,
        ]);
    }
}

