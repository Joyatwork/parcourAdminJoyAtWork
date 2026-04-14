<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserConsent;
use App\Models\User;
use App\Models\RgpdLog;

class ConsentController extends Controller
{
    /**
     * Afficher tous les consentements
     */
    public function index()
    {
        $consents = UserConsent::with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json($consents);
    }

    /**
     * Enregistrer un consentement
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'consent_type' => 'required|string', 
        ]);

        $consent = UserConsent::create([
            'user_id' => $request->user_id,
            'consent_type' => $request->consent_type,
            'granted_at' => now(), 
        ]);

        return response()->json([
            'message' => 'Consentement enregistré avec succès',
            'data' => $consent
        ], 201);
    }

    /**
     * Révoquer un consentement
     */
    public function revoke($id)
    {
        $consent = UserConsent::findOrFail($id);
        $consent->update(['revoked_at' => now()]);

        return response()->json([
            'message' => 'Consentement révoqué avec succès',
            'data' => $consent
        ]);
    }

    /**
     * Droit à l’oubli — Anonymiser un utilisateur
     */
    public function anonymize($id)
    {
        $user = User::findOrFail($id);

        // Anonymisation de l'utilisateur
        $user->update([
            'name' => 'Utilisateur anonymisé',
            'email' => 'deleted_' . $user->id . '@example.com',
            'password' => bcrypt('deleted'),
        ]);

        // Création du log RGPD
        RgpdLog::create([
            'action' => 'anonymisation',
            'user_id' => $user->id,
            'admin_email' => auth()->user()->email ?? 'admin'
        ]);

        return response()->json([
            'message' => 'Utilisateur anonymisé avec succès'
        ]);
    }

    /**
     * Exporter les données d’un utilisateur
     */
    public function exportUserData($id)
    {
        $user = User::with('consents')->findOrFail($id);

        return response()->json([
            'user' => $user,
            'consents' => $user->consents,
        ]);
    }
}