<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InvoiceController extends Controller
{
    /**
     * Liste des factures (filtres simples).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::query()
            ->when($request->filled('entreprise_id'), fn($q) => $q->where('entreprise_id', $request->entreprise_id))
            ->when($request->filled('type'), fn($q) => $q->where('type', $request->type))
            ->when($request->filled('statut'), fn($q) => $q->where('statut', $request->statut))
            ->orderByDesc('id');

        return response()->json($query->paginate(50));
    }

    /**
     * Détail d'une facture.
     */
    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($invoice);
    }

    /**
     * Créer une facture de recharge (entrée d'argent).
     * Payload attendu :
     * - entreprise_id (required)
     * - montant_ht (required)
     * - taux_tva (optional, default 20)
     * - due_date (optional)
     */
    public function storeRecharge(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entreprise_id' => ['required', 'integer', 'exists:entreprises,id'],
            'montant_ht' => ['required', 'numeric', 'min:0'],
            'taux_tva' => ['nullable', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
        ]);

        $invoice = DB::transaction(function () use ($data) {
            $tva = $data['taux_tva'] ?? 20.0;
            $montantTtc = round($data['montant_ht'] * (1 + ($tva / 100)), 2);

            $invoice = Invoice::create([
                'entreprise_id' => $data['entreprise_id'],
                'type' => 'recharge',
                'reference_type' => null,
                'reference_id' => null,
                'numero_facture' => 'INV-' . now()->format('Ymd-His') . '-' . rand(100, 999),
                'montant_ht' => $data['montant_ht'],
                'montant_ttc' => $montantTtc,
                'taux_tva' => $tva,
                'statut' => 'a_emettre',
                'date_emission' => now()->toDateString(),
                'due_date' => $data['due_date'] ?? null,
            ]);

            return $invoice;
        });

        return response()->json($invoice, 201);
    }

    /**
     * Marquer une facture comme payée.
     * Si c'est une facture de recharge, crédite automatiquement le wallet.
     */
    public function markPaid(Request $request, Invoice $invoice): JsonResponse
    {
        DB::transaction(function () use ($invoice) {
            // Mettre à jour la facture
            $invoice->update([
                'statut' => 'payee',
                'paid_at' => now(),
            ]);

            // Si c'est une facture de recharge, créditer le wallet
            if ($invoice->type === 'recharge') {
                $wallet = Wallet::where('entreprise_id', $invoice->entreprise_id)->first();
                
                if ($wallet) {
                    // Créditer le wallet
                    $wallet->balance += $invoice->montant_ht;
                    $wallet->save();

                    // Créer une transaction wallet
                    WalletTransaction::create([
                        'wallet_id' => $wallet->id,
                        'type' => 'credit',
                        'amount' => $invoice->montant_ht,
                        'reference_type' => Invoice::class,
                        'reference_id' => $invoice->id,
                        'description' => "Recharge wallet via facture {$invoice->numero_facture}",
                    ]);
                }
            }
        });

        return response()->json($invoice);
    }
}

