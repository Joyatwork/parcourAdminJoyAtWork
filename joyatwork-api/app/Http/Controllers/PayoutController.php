<?php

namespace App\Http\Controllers;

use App\Models\Payout;
use App\Models\PayoutLine;
use App\Models\Usage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayoutController extends Controller
{
    /**
     * Liste des payouts (filtres praticien, statut, période).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payout::with('lines')
            ->when($request->filled('practitioner_id'), fn($q) => $q->where('practitioner_id', $request->practitioner_id))
            ->when($request->filled('statut'), fn($q) => $q->where('statut', $request->statut))
            ->when($request->filled('periode_debut'), fn($q) => $q->whereDate('periode_debut', '>=', $request->periode_debut))
            ->when($request->filled('periode_fin'), fn($q) => $q->whereDate('periode_fin', '<=', $request->periode_fin))
            ->orderByDesc('id');

        return response()->json($query->paginate(50));
    }

    /**
     * Détail d'un payout.
     */
    public function show(Payout $payout): JsonResponse
    {
        $payout->load('lines.usage');
        return response()->json($payout);
    }

    /**
     * Génération mensuelle (ou période) des payouts pour un praticien donné.
     * Payload :
     * - practitioner_id (obligatoire)
     * - periode_debut (date)
     * - periode_fin (date)
     */
    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'practitioner_id' => ['required', 'integer'],
            'periode_debut' => ['required', 'date'],
            'periode_fin' => ['required', 'date', 'after_or_equal:periode_debut'],
        ]);

        $payout = DB::transaction(function () use ($data) {
            // Récupérer les usages validés pour ce praticien et période
            $usages = Usage::where('practitioner_id', $data['practitioner_id'])
                ->where('statut', 'valide_auto')
                ->whereDate('date_prestation', '>=', $data['periode_debut'])
                ->whereDate('date_prestation', '<=', $data['periode_fin'])
                ->get();

            $montantTotal = $usages->sum('part_praticien_ht');
            $count = $usages->count();

            $payout = Payout::create([
                'practitioner_id' => $data['practitioner_id'],
                'periode_debut' => $data['periode_debut'],
                'periode_fin' => $data['periode_fin'],
                'montant_total_ht' => $montantTotal,
                'nombre_usages' => $count,
                'statut' => 'calcule',
            ]);

            foreach ($usages as $usage) {
                PayoutLine::create([
                    'payout_id' => $payout->id,
                    'usage_id' => $usage->id,
                    'montant_ht' => $usage->part_praticien_ht,
                ]);
            }

            return $payout->load('lines');
        });

        return response()->json($payout, 201);
    }

    /**
     * Marquer un payout comme payé.
     */
    public function markPaid(Request $request, Payout $payout): JsonResponse
    {
        $payout->update([
            'statut' => 'paye',
            'paid_at' => now(),
        ]);

        return response()->json($payout);
    }
}

