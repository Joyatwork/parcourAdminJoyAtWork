<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    /**
     * Affiche le wallet d'une entreprise (via wallet_id ou entreprise_id).
     */
    public function show(Request $request, Wallet $wallet): JsonResponse
    {
        return response()->json($wallet);
    }

    /**
     * Récupère le wallet par entreprise_id (utile si on ne connaît pas l'id du wallet).
     */
    public function findByEntreprise(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entreprise_id' => ['required', 'integer', 'exists:entreprises,id'],
        ]);

        $wallet = Wallet::where('entreprise_id', $data['entreprise_id'])->firstOrFail();
        return response()->json($wallet);
    }

    /**
     * Historique des transactions du wallet.
     */
    public function transactions(Request $request, Wallet $wallet): JsonResponse
    {
        $query = $wallet->transactions()
            ->orderByDesc('id');

        return response()->json($query->paginate(50));
    }

    /**
     * Statistiques simples : balance, total rechargé, total débité, crédits restants (tous services confondus).
     */
    public function stats(Wallet $wallet): JsonResponse
    {
        $totalCredit = $wallet->transactions()->where('type', 'credit')->sum('amount');
        $totalDebit = $wallet->transactions()->where('type', 'debit')->sum('amount');

        // Somme des crédits restants pour l'entreprise
        $creditsRestants = \App\Models\Credit::where('entreprise_id', $wallet->entreprise_id)
            ->sum('quantite_restante');

        return response()->json([
            'balance' => $wallet->balance,
            'devise' => $wallet->devise,
            'total_credit' => (float) $totalCredit,
            'total_debit' => (float) $totalDebit,
            'credits_restants' => (int) $creditsRestants,
        ]);
    }
}

