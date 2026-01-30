<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    /**
     * Afficher la liste des entreprises
     */
    public function index(Request $request): JsonResponse
    {
        $query = Company::query();

        // Filtrage par secteur (industry dans la table legacy)
        if ($request->has('sector') && $request->sector !== 'Tous les secteurs') {
            $query->where('industry', $request->sector);
        }

        // Recherche par nom, secteur ou localisation (adresse/ville/pays)
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('industry', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }

        $companiesData = [];
        foreach ($query->orderBy('name')->get() as $company) {
            $companiesData[] = $this->mapToFrontend($company);
        }

        return response()->json($companiesData);
    }

    /**
     * Afficher une entreprise spécifique
     */
    public function show(Company $company): JsonResponse
    {
        return response()->json($this->mapToFrontend($company));
    }

    /**
     * Créer une nouvelle entreprise
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sector' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'siret' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|unique:entreprises,email',
            'website' => 'nullable|url',
        ]);

        // Mapping vers le schéma legacy
        $data = [
            'name' => $validatedData['name'],
            'industry' => $validatedData['industry'] ?? $validatedData['sector'] ?? 'Non spécifié',
            'siret' => $validatedData['siret'] ?? null,
            'address' => $validatedData['address'] ?? $validatedData['location'] ?? null,
            'city' => $validatedData['city'] ?? null,
            'postal_code' => $validatedData['postal_code'] ?? null,
            'country' => $validatedData['country'] ?? null,
            'email' => $validatedData['email'],
            'phone' => $validatedData['phone'] ?? null,
            'website' => $validatedData['website'] ?? null,
        ];

        $company = Company::create($data);

        return response()->json($this->mapToFrontend($company), 201);
    }

    /**
     * Mettre à jour une entreprise
     */
    public function update(Request $request, Company $company): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'sector' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'siret' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'sometimes|required|email|unique:entreprises,email,' . $company->id,
            'website' => 'nullable|url',
        ]);

        $data = [
            'name' => $validatedData['name'] ?? $company->name,
            'industry' => $validatedData['industry'] ?? $validatedData['sector'] ?? $company->industry,
            'siret' => $validatedData['siret'] ?? $company->siret,
            'address' => $validatedData['address'] ?? $validatedData['location'] ?? $company->address,
            'city' => $validatedData['city'] ?? $company->city,
            'postal_code' => $validatedData['postal_code'] ?? $company->postal_code,
            'country' => $validatedData['country'] ?? $company->country,
            'email' => $validatedData['email'] ?? $company->email,
            'phone' => $validatedData['phone'] ?? $company->phone,
            'website' => $validatedData['website'] ?? $company->website,
        ];

        $company->update($data);

        return response()->json($this->mapToFrontend($company));
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
            'active_contracts' => 0,
            'total_employees' => 0,
            'total_revenue' => 0,
            'average_rating' => 0,
            'sectors' => Company::select('industry')
                ->groupBy('industry')
                ->selectRaw('industry, count(*) as count')
                ->get()
                ->pluck('count', 'industry')
        ];

        return response()->json($stats);
    }

    private function mapToFrontend(Company $company): array
    {
        $locationParts = array_filter([
            $company->address,
            $company->city,
            $company->country,
        ]);

        return [
            'id' => $company->id,
            'name' => $company->name,
            'sector' => $company->industry ?? 'Secteur non défini',
            'location' => empty($locationParts) ? 'Localisation non définie' : implode(', ', $locationParts),
            'employees' => 0,
            'phone' => $company->phone,
            'email' => $company->email,
            'website' => $company->website,
            'description' => null,
            'wellness_programs' => [],
            'status' => 'Actif',
            'contract_value' => null,
            'verified' => false,
            'created_at' => $company->created_at,
            'updated_at' => $company->updated_at,
        ];
    }
}
