<?php

namespace App\Http\Controllers;
use App\Models\KpiCompanyHealth;
use Illuminate\Http\Request;

class KpiCompanyHealthController extends Controller
{
    /**
     * Récupère les métriques globales pour le dashboard JoyatWork
     */
    public function getGlobalMetrics(Request $request)
    {
        // Récupérer les paramètres ou utiliser des valeurs par défaut
        $year = $request->input('year', 2025);
        $month = $request->input('month', 11);
        
        // Vérifier d'abord s'il existe des données pour ce mois/année
        $exists = KpiCompanyHealth::where('year', $year)
            ->where('month', $month)
            ->exists();
        
        if (!$exists) {
            return response()->json([
                'status' => 'success',
                'data' => [], // Tableau vide quand pas de données
                'message' => 'Aucune donnée disponible pour cette période'
            ]);
        }
        
        $metrics = KpiCompanyHealth::where('year', $year)
            ->where('month', $month)
            ->selectRaw('
                AVG(stress_score) as stress,
                AVG(energy_score) as energy,
                AVG(sleep_score) as sleep,
                AVG(physical_score) as physical,
                AVG(tms_score) as tms,
                AVG(satisfaction_score) as satisfaction,
                AVG(social_score) as social
            ')
            ->first();

        // Définir les statuts
        $getStatus = function($value, $type) {
            switch($type) {
                case 'stress': // Plus haut = mieux
                    return $value > 60 ? 'good' : ($value > 40 ? 'medium' : 'warning');
                case 'energy': // Plus haut = mieux
                case 'sleep':
                case 'physical':
                case 'satisfaction':
                case 'social':
                    return $value < 50 ? 'warning' : ($value < 70 ? 'medium' : 'good');
                case 'tms': // Plus bas = mieux
                    return $value > 40 ? 'warning' : ($value > 30 ? 'medium' : 'good');
                default:
                    return 'medium';
            }
        };

        return response()->json([
            'status' => 'success',
            'data' => [
                ['category' => 'Stress', 'value' => round($metrics->stress), 'status' => $getStatus($metrics->stress, 'stress')],
                ['category' => 'Énergie', 'value' => round($metrics->energy), 'status' => $getStatus($metrics->energy, 'energy')],
                ['category' => 'Sommeil', 'value' => round($metrics->sleep), 'status' => $getStatus($metrics->sleep, 'sleep')],
                ['category' => 'Forme physique', 'value' => round($metrics->physical), 'status' => $getStatus($metrics->physical, 'physical')],
                ['category' => 'TMS Score', 'value' => round($metrics->tms), 'status' => $getStatus($metrics->tms, 'tms')],
                ['category' => 'Satisfaction', 'value' => round($metrics->satisfaction), 'status' => $getStatus($metrics->satisfaction, 'satisfaction')],
                ['category' => 'Social', 'value' => round($metrics->social), 'status' => $getStatus($metrics->social, 'social')],
            ]
        ]);
    }
}