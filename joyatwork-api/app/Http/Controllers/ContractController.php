<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ContractController extends Controller
{
    /**
     * Afficher la liste des contrats avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contract::query();

        // Filtrer par entreprise
        if ($request->has('entreprise_id')) {
            $query->where('entreprise_id', $request->entreprise_id);
        }

        // Filtrer par statut
        if ($request->has('statut') && $request->statut) {
            $query->where('statut', $request->statut);
        }

        // Recherche par numéro de contrat ou description
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_contrat', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $contrats = $query->with('entreprise:id,name')
                          ->orderBy('date_debut', 'desc')
                          ->get();

        return response()->json($contrats);
    }

    /**
     * Afficher un contrat spécifique
     */
    public function show(Contract $contract): JsonResponse
    {
        $contract->load('entreprise');
        return response()->json($contract);
    }

    /**
     * Créer un nouveau contrat
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'entreprise_id' => 'required|exists:entreprises,id',
            'type_contrat' => 'nullable|in:Standard,Premium,Enterprise',
            'statut' => 'nullable|in:En négociation,En attente signature,Actif,Expiré,Résilié',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'date_signature' => 'nullable|date',
            'date_renouvellement' => 'nullable|date',
            'montant_annuel' => 'required|numeric|min:0',
            'montant_mensuel' => 'nullable|numeric|min:0',
            'devise' => 'nullable|string|size:3',
            'description' => 'nullable|string',
            'conditions_particulieres' => 'nullable|string',
            'nombre_employes_couverts' => 'nullable|integer|min:0',
        ]);

        // Générer le numéro de contrat si non fourni
        if (!isset($validatedData['numero_contrat'])) {
            $year = Carbon::now()->year;
            $lastContract = Contract::whereYear('created_at', $year)
                                   ->orderBy('id', 'desc')
                                   ->first();
            
            $number = $lastContract 
                ? (int) substr($lastContract->numero_contrat, -3) + 1 
                : 1;
            
            $validatedData['numero_contrat'] = sprintf('CONTRACT-%d-%03d', $year, $number);
        }

        // Calculer montant_mensuel si non fourni
        if (!isset($validatedData['montant_mensuel']) && isset($validatedData['montant_annuel'])) {
            $validatedData['montant_mensuel'] = round($validatedData['montant_annuel'] / 12, 2);
        }

        // Valeurs par défaut
        if (!isset($validatedData['devise'])) {
            $validatedData['devise'] = 'EUR';
        }
        if (!isset($validatedData['statut'])) {
            $validatedData['statut'] = 'En négociation';
        }
        if (!isset($validatedData['type_contrat'])) {
            $validatedData['type_contrat'] = 'Standard';
        }

        $contract = Contract::create($validatedData);
        $contract->load('entreprise');

        return response()->json($contract, 201);
    }

    /**
     * Mettre à jour un contrat
     */
    public function update(Request $request, Contract $contract): JsonResponse
    {
        $validatedData = $request->validate([
            'type_contrat' => 'sometimes|in:Standard,Premium,Enterprise',
            'statut' => 'sometimes|in:En négociation,En attente signature,Actif,Expiré,Résilié',
            'date_debut' => 'sometimes|date',
            'date_fin' => 'sometimes|nullable|date|after:date_debut',
            'date_signature' => 'sometimes|nullable|date',
            'date_renouvellement' => 'sometimes|nullable|date',
            'montant_annuel' => 'sometimes|numeric|min:0',
            'montant_mensuel' => 'sometimes|nullable|numeric|min:0',
            'devise' => 'sometimes|string|size:3',
            'description' => 'sometimes|nullable|string',
            'conditions_particulieres' => 'sometimes|nullable|string',
            'nombre_employes_couverts' => 'sometimes|nullable|integer|min:0',
        ]);

        // Recalculer montant_mensuel si montant_annuel change
        if (isset($validatedData['montant_annuel']) && !isset($validatedData['montant_mensuel'])) {
            $validatedData['montant_mensuel'] = round($validatedData['montant_annuel'] / 12, 2);
        }

        $contract->update($validatedData);
        $contract->load('entreprise');

        return response()->json($contract);
    }

    /**
     * Supprimer un contrat
     */
    public function destroy(Contract $contract): JsonResponse
    {
        $contract->delete();

        return response()->json(null, 204);
    }

    /**
     * Obtenir les statistiques des contrats
     */
    public function stats(): JsonResponse
    {
        // Debug: Vérifier les statuts réels dans la base
        $allStatuses = Contract::selectRaw('statut, count(*) as count')
                              ->groupBy('statut')
                              ->get()
                              ->pluck('count', 'statut');
        
        // Utiliser une comparaison insensible à la casse et trim les espaces
        $contratsActifs = Contract::whereRaw('TRIM(UPPER(statut)) = ?', ['ACTIF'])->count();
        $chiffreAffaires = Contract::whereRaw('TRIM(UPPER(statut)) = ?', ['ACTIF'])->sum('montant_annuel');
        
        $stats = [
            'total_contrats' => Contract::count(),
            'contrats_actifs' => $contratsActifs,
            'contrats_en_negociation' => Contract::whereRaw('TRIM(UPPER(statut)) = ?', ['EN NÉGOCIATION'])->count(),
            'contrats_expires' => Contract::whereRaw('TRIM(UPPER(statut)) = ?', ['EXPIRÉ'])->count(),
            'chiffre_affaires_annuel' => $chiffreAffaires ?? 0,
            'contrats_par_type' => Contract::selectRaw('type_contrat, count(*) as count')
                                          ->groupBy('type_contrat')
                                          ->get()
                                          ->pluck('count', 'type_contrat'),
            // Debug temporaire - à retirer après
            'debug_statuts' => $allStatuses,
        ];

        return response()->json($stats);
    }
}
