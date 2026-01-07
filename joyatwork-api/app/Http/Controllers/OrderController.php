<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderLine;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Credit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Liste des commandes (filtres simples).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('lines')
            ->when($request->filled('entreprise_id'), fn($q) => $q->where('entreprise_id', $request->entreprise_id))
            ->when($request->filled('statut'), fn($q) => $q->where('statut', $request->statut))
            ->orderByDesc('id');

        return response()->json($query->paginate(50));
    }

    /**
     * Détail d'une commande.
     */
    public function show(Order $order): JsonResponse
    {
        $order->load('lines');
        return response()->json($order);
    }

    /**
     * Créer une commande qui débite directement le wallet et génère des crédits.
     * Payload attendu :
     * - entreprise_id
     * - date_commande (optionnel)
     * - lignes: [{ type_service, quantite, prix_unitaire_ht, part_joyatwork_pct, part_praticien_pct }]
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entreprise_id' => ['required', 'integer', 'exists:entreprises,id'],
            'date_commande' => ['nullable', 'date'],
            'lignes' => ['required', 'array', 'min:1'],
            'lignes.*.type_service' => ['required', 'string', 'max:100'],
            'lignes.*.quantite' => ['required', 'integer', 'min:1'],
            'lignes.*.prix_unitaire_ht' => ['required', 'numeric', 'min:0'],
            'lignes.*.part_joyatwork_pct' => ['required', 'numeric', 'min:0', 'max:100'],
            'lignes.*.part_praticien_pct' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        // Calcul du total
        $montantTotal = 0;
        foreach ($data['lignes'] as $ligne) {
            $montantTotal += $ligne['quantite'] * $ligne['prix_unitaire_ht'];
        }

        // Transaction : vérifier solde, débiter, créer order + crédits
        $order = DB::transaction(function () use ($data, $montantTotal) {
            $wallet = Wallet::lockForUpdate()->where('entreprise_id', $data['entreprise_id'])->first();
            if (!$wallet) {
                abort(422, 'Wallet introuvable pour cette entreprise');
            }
            if ($wallet->balance < $montantTotal) {
                abort(422, 'Solde insuffisant pour cette commande');
            }

            // Débit
            $wallet->balance = $wallet->balance - $montantTotal;
            $wallet->save();

            $order = Order::create([
                'entreprise_id' => $data['entreprise_id'],
                'numero_commande' => 'ORD-' . now()->format('Ymd-His') . '-' . rand(100, 999),
                'montant_total_ht' => $montantTotal,
                'montant_total_ttc' => $montantTotal, // TTC identique ici (TTC géré via invoice si besoin)
                'statut' => 'confirmed',
                'date_commande' => $data['date_commande'] ?? now()->toDateString(),
            ]);

            // Lignes + crédits
            foreach ($data['lignes'] as $ligne) {
                $orderLine = OrderLine::create([
                    'order_id' => $order->id,
                    'type_service' => $ligne['type_service'],
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire_ht' => $ligne['prix_unitaire_ht'],
                    'montant_ligne_ht' => $ligne['quantite'] * $ligne['prix_unitaire_ht'],
                    'part_joyatwork_pct' => $ligne['part_joyatwork_pct'],
                    'part_praticien_pct' => $ligne['part_praticien_pct'],
                ]);

                Credit::create([
                    'entreprise_id' => $order->entreprise_id,
                    'order_line_id' => $orderLine->id,
                    'type_service' => $ligne['type_service'],
                    'quantite_initiale' => $ligne['quantite'],
                    'quantite_restante' => $ligne['quantite'],
                    'date_expiration' => null,
                ]);
            }

            // Transaction wallet
            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'debit',
                'amount' => $montantTotal,
                'reference_type' => Order::class,
                'reference_id' => $order->id,
                'description' => 'Débit wallet pour commande ' . $order->numero_commande,
            ]);

            return $order->load('lines');
        });

        return response()->json($order, 201);
    }
}

