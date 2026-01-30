<?php

namespace App\Http\Controllers;
use App\Models\KpiCompanyHealth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class KpiCompanyHealthController extends Controller
{
    /**
     * Récupère les métriques globales pour le dashboard JoyatWork
     */

    public function get_global_health(Request $request)
    {
        // 1. Get parameters from the request
        $year = $request->input('year');
        $month = $request->input('month');

        // 2. Use bindings to prevent SQL injection and filter the results
        $data = DB::select("
            SELECT *
            FROM v_global_company_health_v2
            WHERE year = ? AND month = ?
            LIMIT 1
        ", [$year, $month]);

        return response()->json($data);
    }
}