<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    /**
     * Afficher la liste des entreprises avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = Company::query();

        // Filtrage par secteur
        if ($request->has('sector') && $request->sector !== 'Tous les secteurs') {
            $query->where('sector', $request->sector);
        }

        // Filtrage par statut
        if ($request->has('status') && $request->status !== 'Tous les statuts') {
            $query->where('status', $request->status);
        }

        // Recherche par nom, secteur ou localisation
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sector', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $companies = $query->orderBy('name')->get();

        return response()->json($companies);
    }

    /**
     * Afficher une entreprise spécifique
     */
    public function show(Company $company): JsonResponse
    {
        return response()->json($company);
    }

    /**
     * Créer une nouvelle entreprise
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sector' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'employees' => 'required|integer|min:0',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|unique:companies,email',
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'wellness_programs' => 'nullable|array',
            'status' => 'nullable|in:Actif,En négociation,Inactif',
            'contract_value' => 'nullable|numeric|min:0',
            'verified' => 'boolean'
        ]);

        $company = Company::create($validatedData);

        return response()->json($company, 201);
    }

    /**
     * Mettre à jour une entreprise
     */
    public function update(Request $request, Company $company): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sector' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string|max:255',
            'employees' => 'sometimes|required|integer|min:0',
            'phone' => 'nullable|string|max:20',
            'email' => 'sometimes|required|email|unique:companies,email,' . $company->id,
            'website' => 'nullable|url',
            'description' => 'nullable|string',
            'wellness_programs' => 'nullable|array',
            'status' => 'nullable|in:Actif,En négociation,Inactif',
            'contract_value' => 'nullable|numeric|min:0',
            'verified' => 'boolean'
        ]);

        $company->update($validatedData);

        return response()->json($company);
    }

    /**
     * Supprimer une entreprise
     */
    public function destroy(Company $company): JsonResponse
    {
        $company->delete();

        return response()->json(null, 204);
    }

    /**
     * Obtenir les statistiques des entreprises
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_companies' => Company::count(),
            'active_contracts' => Company::active()->count(),
            'total_employees' => Company::sum('employees'),
            'total_revenue' => Company::sum('contract_value'),
            'average_rating' => 94, // Pourcentage de satisfaction client
            'sectors' => Company::select('sector')
                ->groupBy('sector')
                ->selectRaw('sector, count(*) as count')
                ->get()
                ->pluck('count', 'sector')
        ];

        return response()->json($stats);
    }
}
