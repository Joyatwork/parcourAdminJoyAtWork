<?php

namespace App\Http\Controllers;

use App\Models\Credit;
use App\Models\OrderLine;
use App\Models\Usage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UsageController extends Controller
{
    /**
     * Liste des usages (filtres simples).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Usage::query()
            ->when($request->filled('entreprise_id'), fn ($q) =>
                $q->where('entreprise_id', $request->entreprise_id)
            )
            ->when($request->filled('practitioner_id'), fn ($q) =>
                $q->where('practitioner_id', $request->practitioner_id)
            )
            ->when($request->filled('statut'), fn ($q) =>
                $q->where('statut', $request->statut)
            )
            ->orderByDesc('id');

        return response()->json($query->paginate(50));
    }

    /**
     * Créer un usage et tenter la validation automatique.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'entreprise_id' => ['required', 'integer', 'exists:entreprises,id'],
            'practitioner_id' => ['nullable', 'integer'],
            'employee_id' => ['nullable', 'integer'],
            'type_service' => ['required', 'string', 'max:100'],
            'date_prestation' => ['required', 'date'],
            'prix_ht' => ['required', 'numeric', 'min:0'],
            'part_joyatwork_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'part_praticien_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'order_line_id' => ['nullable', 'integer', 'exists:order_lines,id'],
        ]);

        $usage = DB::transaction(function () use ($data) {

            $orderLine = null;
            if (!empty($data['order_line_id'])) {
                $orderLine = OrderLine::find($data['order_line_id']);
            }

            // Chercher un crédit disponible
            $credit = Credit::lockForUpdate()
                ->where('entreprise_id', $data['entreprise_id'])
                ->where('type_service', $data['type_service'])
                ->where('quantite_restante', '>', 0)
                ->first();

            // Détermination des parts
            $partJawPct = $data['part_joyatwork_pct'] ?? ($orderLine->part_joyatwork_pct ?? 0);
            $partPratPct = $data['part_praticien_pct'] ?? ($orderLine->part_praticien_pct ?? 0);

            $partJaw = round(($data['prix_ht'] * $partJawPct) / 100, 2);
            $partPrat = round(($data['prix_ht'] * $partPratPct) / 100, 2);

            $statut = 'refuse';
            $creditId = null;

            if ($credit) {
                $credit->quantite_restante -= 1;
                $credit->save();

                $statut = 'valide_auto';
                $creditId = $credit->id;
            }

            return Usage::create([
                'entreprise_id' => $data['entreprise_id'],
                'employee_id' => $data['employee_id'] ?? null,
                'practitioner_id' => $data['practitioner_id'] ?? null,
                'order_line_id' => $data['order_line_id'] ?? null,
                'credit_id' => $creditId,
                'type_service' => $data['type_service'],
                'date_prestation' => $data['date_prestation'],
                'prix_ht' => $data['prix_ht'],
                'part_joyatwork_ht' => $partJaw,
                'part_praticien_ht' => $partPrat,
                'statut' => $statut,
                'validated_at' => $statut === 'valide_auto' ? now() : null,
            ]);
        });

        return response()->json($usage, 201);
    }

    /**
     * 🔥 TENDANCES D'USAGE (Sprint Admin 2)
     * Lecture macro, anonymisée, par mois
     */
    public function tendances(): JsonResponse
    {
        $tendances = Usage::select(
                DB::raw('YEAR(date_prestation) as annee'),
                DB::raw('MONTH(date_prestation) as mois'),
                DB::raw('COUNT(*) as total_usage'),
                DB::raw('COUNT(DISTINCT entreprise_id) as entreprises_actives')
            )
            ->where('statut', 'valide_auto')
            ->groupBy(
                DB::raw('YEAR(date_prestation)'),
                DB::raw('MONTH(date_prestation)')
            )
            ->orderBy('annee')
            ->orderBy('mois')
            ->get();

        return response()->json($tendances);
    }
}
