<?php 
    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\DB; // <--- Critical import

    class DiagnosticController extends Controller
    {
        public function get_users_health_per_month()
    {
        // Suppression de la virgule après le premier JOIN et simplification
        $results = DB::select("
            SELECT 
                u.id as user_id,
                u.first_name,
                u.last_name,
                e.name as company_name,
                u.entreprise_id,
                DATE_FORMAT(d.created_at, '%Y-%m') AS month,
                AVG(d.stress_level) AS avg_stress,
                AVG(d.energy_level) AS avg_energy
            FROM diagnostics d
            JOIN users u ON u.id = d.user_id
            JOIN entreprises e ON e.id = u.entreprise_id
            GROUP BY u.id, u.first_name, u.last_name, e.name, u.entreprise_id, month
            ORDER BY month DESC, u.last_name ASC
        ");

        return response()->json($results);
    }

        public function get_company_health_per_month()
        {
            $results = DB::select("
                SELECT 
                    u.entreprise_id,
                    e.name as company_name,
                    DATE_FORMAT(d.created_at, '%Y-%m') AS month,
                    AVG(d.stress_level) AS avg_stress,
                    AVG(d.energy_level) AS avg_energy
                FROM diagnostics d
                JOIN users u ON u.id = d.user_id
                JOIN entreprises e ON e.id = u.entreprise_id
                GROUP BY u.entreprise_id, e.name, month
                ORDER BY u.entreprise_id, month
            ");

            return response()->json($results);
        }

    }