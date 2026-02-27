<?php

namespace App\Http\Controllers;



class AdoptionChurnController extends Controller
{
    // Méthode pour renvoyer les données d'adoption et churn
    public function index()
    {
        // Exemple de données fictives (à remplacer par la vraie base)
        $data = [
            [
                'company_id' => 1,
                'company_name' => 'Acme Corp',
                'total_employees' => 50,
                'active_users' => 30,
                'adoption_rate' => 60,
                'risk_level' => 'Medium',
                'satisfaction_score' => 80
            ],
            [
                'company_id' => 2,
                'company_name' => 'Beta Inc',
                'total_employees' => 100,
                'active_users' => 40,
                'adoption_rate' => 40,
                'risk_level' => 'High',
                'satisfaction_score' => 60
            ],
            [
                'company_id' => 3,
                'company_name' => 'Gamma Ltd',
                'total_employees' => 70,
                'active_users' => 70,
                'adoption_rate' => 100,
                'risk_level' => 'Low',
                'satisfaction_score' => 90
            ]
        ];

        return response()->json($data);
    }
}