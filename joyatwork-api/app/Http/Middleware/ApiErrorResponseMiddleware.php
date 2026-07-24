<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiErrorResponseMiddleware
{
    /**
     * Gérer la requête
     */
    public function handle(Request $request, Closure $next)
    {
        // Intercepter la réponse
        $response = $next($request);

        // Ajouter les en-têtes CORS systématiquement pour les requêtes API
        if ($request->path() && strpos($request->path(), 'api/') === 0) {
            // Déterminer l'origine autorisée
            $origin = $request->header('Origin');
            $allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001',
                'http://127.0.0.1:3002',
                'https://parcour-admin-joy-at-work.vercel.app',
                'https://parcour-admin-joy-at-work-m61u-git-dev-joyatwork1.vercel.app',
            ];

            if (in_array($origin, $allowedOrigins)) {
                $response->header('Access-Control-Allow-Origin', $origin);
                $response->header('Access-Control-Allow-Credentials', 'true');
                $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
                $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
                $response->header('Access-Control-Max-Age', '3600');
            }
        }

        return $response;
    }
}
