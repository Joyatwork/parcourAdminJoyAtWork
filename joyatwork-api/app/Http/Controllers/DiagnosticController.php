<?php 
    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use Illuminate\Support\Facades\DB; // <--- Critical import

    class DiagnosticController extends Controller
    {
        public function get_company_health_per_month()
        {
            $results = DB::select("SELECT * FROM v_company_health_per_month ORDER BY month DESC");
            return response()->json($results);
        }

        public function get_users_health_per_month()
        {
            $results = DB::select("SELECT * FROM v_users_health_per_month ORDER BY month DESC");
            return response()->json($results);
        }

    }