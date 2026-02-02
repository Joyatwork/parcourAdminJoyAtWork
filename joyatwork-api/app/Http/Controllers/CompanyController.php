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

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('domain', 'like', "%{$search}%")
                  ->orWhere('ville', 'like', "%{$search}%")
                  ->orWhere('secteur_activite', 'like', "%{$search}%");
            });
        }

        if ($request->has('sector') && $request->sector && $request->sector !== 'Tous les secteurs') {
            $query->where('secteur_activite', $request->sector);
        }

        $rawCompanies = $query->orderBy('name')->get();
        $mappedCompanies = [];
        foreach ($rawCompanies as $company) {
            $mappedCompanies[] = $this->mapToFrontend($company);
        }

        return response()->json($mappedCompanies);
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
            'domain' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'adresse_facturation' => 'nullable|string',
            'code_postal' => 'nullable|string|max:10',
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:50',
            'siret' => 'nullable|string|max:14',
            'numero_tva' => 'nullable|string|max:20',
            'forme_juridique' => 'nullable|string|max:50',
            'contact_principal' => 'nullable|string|max:100',
            'email_contact' => 'nullable|email|max:255',
            'telephone_contact' => 'nullable|string|max:20',
            'nombre_employes' => 'nullable|integer',
            'secteur_activite' => 'nullable|string|max:100',
            'site_web' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date_premier_contact' => 'nullable|date',
            'source_lead' => 'nullable|string|max:50',
        ]);

        $company = Company::create($validatedData);

        return response()->json(['success' => true, 'data' => $this->mapToFrontend($company)], 201);
    }

    /**
     * Mettre à jour une entreprise
     */
    public function update(Request $request, Company $company): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'domain' => 'sometimes|nullable|string|max:255',
            'is_active' => 'sometimes|nullable|boolean',
            'adresse_facturation' => 'nullable|string',
            'code_postal' => 'nullable|string|max:10',
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:50',
            'siret' => 'nullable|string|max:14',
            'numero_tva' => 'nullable|string|max:20',
            'forme_juridique' => 'nullable|string|max:50',
            'contact_principal' => 'nullable|string|max:100',
            'email_contact' => 'nullable|email|max:255',
            'telephone_contact' => 'nullable|string|max:20',
            'nombre_employes' => 'nullable|integer',
            'secteur_activite' => 'nullable|string|max:100',
            'site_web' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'date_premier_contact' => 'nullable|date',
            'source_lead' => 'nullable|string|max:50',
        ]);

        $company->update($validatedData);

        return response()->json(['success' => true, 'data' => $this->mapToFrontend($company)]);
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
            'active_contracts' => Company::where('is_active', true)->count(),
            'total_employees' => Company::sum('nombre_employes') ?? 0,
            'sectors' => Company::distinct('secteur_activite')
                ->pluck('secteur_activite')
                ->filter()
                ->values()
                ->toArray(),
        ];

        return response()->json($stats);
    }

    /**
     * Mapper les données de la base de données vers le format attendu par le frontend
     */
    private function mapToFrontend(Company $company): array
    {
        $location = trim(implode(', ', array_filter([
            $company->adresse_facturation,
            $company->code_postal,
            $company->ville,
            $company->pays,
        ])));

        return [
            'id' => $company->id,
            'name' => $company->name,
            'domain' => $company->domain,
            'sector' => $company->secteur_activite ?? 'Secteur non défini',
            'location' => !empty($location) ? $location : 'Localisation non définie',
            'email' => $company->email_contact ?? '',
            'phone' => $company->telephone_contact ?? '',
            'website' => $company->site_web ?? '',
            'description' => $company->description ?? '',
            'employees' => $company->nombre_employes ?? 0,
            'status' => $company->is_active ? 'Actif' : 'Inactif',
            'verified' => false,
            'wellness_programs' => [],
            'contract_value' => 0,
            // Champs additionnels pour le backend
            'siret' => $company->siret,
            'numero_tva' => $company->numero_tva,
            'forme_juridique' => $company->forme_juridique,
            'contact_principal' => $company->contact_principal,
            'date_premier_contact' => $company->date_premier_contact,
            'source_lead' => $company->source_lead,
            'adresse_facturation' => $company->adresse_facturation,
            'code_postal' => $company->code_postal,
            'ville' => $company->ville,
            'pays' => $company->pays,
            'secteur_activite' => $company->secteur_activite,
            'site_web' => $company->site_web,
            'email_contact' => $company->email_contact,
            'telephone_contact' => $company->telephone_contact,
            'nombre_employes' => $company->nombre_employes,
            'is_active' => $company->is_active,
            'created_at' => $company->created_at,
            'updated_at' => $company->updated_at,
        ];
    }
}
