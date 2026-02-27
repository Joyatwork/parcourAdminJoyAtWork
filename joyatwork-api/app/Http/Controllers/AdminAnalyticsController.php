<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Usage;
use Illuminate\Http\JsonResponse;

class AdminAnalyticsController extends Controller
{
    /**
     * 📊 GET /admin/usage
     * Taux d’usage par entreprise (dashboard global)
     */
    public function usageByCompany(): JsonResponse
    {
        $companies = Company::all();

        $usageCounts = Usage::selectRaw('entreprise_id, COUNT(*) as active_users')
            ->groupBy('entreprise_id')
            ->pluck('active_users', 'entreprise_id');

        $data = $companies->map(function ($company) use ($usageCounts) {

            $totalEmployees = $company->nombre_employes ?? 0;
            $activeUsers = $usageCounts->get($company->id, 0);

            $usageRate = $totalEmployees > 0
                ? round(($activeUsers / $totalEmployees) * 100)
                : 0;

            return [
                "company" => $company->name,
                "usage_rate" => $usageRate
            ];
        })->values();

        return response()->json($data);
    }

    /**
     * 🚨 GET /admin/churn-risk
     * Adoption & churn (Sprint 4 Admin)
     */
    public function churnRisk(): JsonResponse
    {
        $companies = Company::all();

        $usageCounts = Usage::selectRaw('entreprise_id, COUNT(*) as active_users')
            ->groupBy('entreprise_id')
            ->pluck('active_users', 'entreprise_id');

        $result = $companies->map(function ($company) use ($usageCounts) {

            $totalEmployees = $company->nombre_employes ?? 0;
            $activeUsers = $usageCounts->get($company->id, 0);

            $usageRate = $totalEmployees > 0
                ? round(($activeUsers / $totalEmployees) * 100)
                : 0;

            // 🎯 Règle churn Joyatwork
            $risk = "low";
            if ($usageRate < 40) $risk = "high";
            elseif ($usageRate < 70) $risk = "medium";

            return [
                "company" => $company->name,
                "usage_rate" => $usageRate,
                "satisfaction" => round(rand(60,95)/10,1), // 6.0 → 9.5
                "churn_risk" => $risk
            ];
        })->values();

        return response()->json($result);
    }
}