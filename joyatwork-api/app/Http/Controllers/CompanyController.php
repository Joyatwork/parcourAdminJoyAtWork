<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    /**
     * Afficher la liste des entreprises avec recherche simple
     */
    public function index(Request $request): JsonResponse
    {
        $query = Company::query();

        // Recherche par nom ou domaine
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%");
            });
        }

        $companies = $query->orderBy('name')->get([
            'id',
            'name',
            'domain',
            'is_active',
            'created_at',
            'updated_at',
        ]);

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
     * Créer une nouvelle entreprise (basée sur la table 'entreprise')
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $company = Company::create($validatedData);

        return response()->json($company, 201);
    }

    /**
     * Mettre à jour une entreprise (basée sur la table 'entreprise')
     */
    public function update(Request $request, Company $company): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'domain' => 'sometimes|nullable|string|max:255',
            'is_active' => 'sometimes|nullable|boolean',
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
        // La table 'entreprise' ne contient que des informations basiques.
        // On adapte donc les statistiques pour rester compatibles
        // avec le front actuel tout en utilisant les données disponibles.
        $stats = [
            'total_companies' => Company::count(),
            // On considère "active_contracts" comme le nombre d'entreprises actives
            'active_contracts' => Company::where('is_active', true)->count(),
            // Ces valeurs ne sont pas disponibles dans la table 'entreprise'
            'total_employees' => 0,
            'total_revenue' => 0,
            'average_rating' => 0,
            'sectors' => [],
        ];

        return response()->json($stats);
    }
}
