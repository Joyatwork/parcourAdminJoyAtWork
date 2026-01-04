<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChallengeCitationTheme;

class ChallengeCitationThemeController extends Controller
{
    // Liste des thèmes
    public function index()
    {
        return ChallengeCitationTheme::all();
    }

    // Un thème + ses citations
    public function show($id)
    {
        return ChallengeCitationTheme::with('citations')->findOrFail($id);
    }

    // Créer un thème
    public function store()
    {
        return ChallengeCitationTheme::create(request()->validate([
            'theme' => 'required|string|max:255',
        ]));
    }

    // Supprimer un thème
    public function destroy($id)
    {
        ChallengeCitationTheme::findOrFail($id)->delete();
        return response()->json(['message' => 'Theme deleted']);
    }
}
