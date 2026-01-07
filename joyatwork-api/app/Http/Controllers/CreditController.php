<?php

namespace App\Http\Controllers;

use App\Models\Credit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreditController extends Controller
{
    /**
     * Liste des crédits (filtres : entreprise_id, type_service, actifs).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Credit::query()
            ->when($request->filled('entreprise_id'), fn($q) => $q->where('entreprise_id', $request->entreprise_id))
            ->when($request->filled('type_service'), fn($q) => $q->where('type_service', $request->type_service))
            ->when($request->boolean('actifs'), fn($q) => $q->where('quantite_restante', '>', 0))
            ->orderByDesc('id');

        return response()->json($query->paginate(50));
    }

    /**
     * Détail d'un crédit.
     */
    public function show(Credit $credit): JsonResponse
    {
        return response()->json($credit);
    }
}

