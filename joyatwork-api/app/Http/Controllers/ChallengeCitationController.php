<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChallengeCitation;
use Illuminate\Http\Request;

class ChallengeCitationController extends Controller
{
    // Toutes les citations (avec thème)
    public function index()
    {
        return ChallengeCitation::all();
    }

    // Une citation
    public function show($id)
    {
        return ChallengeCitation::findOrFail($id);
    }

    // Créer une citation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'theme_id' => 'required|exists:challenge_citations_theme,id',
            'auteur' => 'nullable|string|max:100',
            'citation' => 'required|string',
            'benefice' => 'nullable|string|max:100',
            'musique_url' => 'nullable|string|max:255',
            'video_url' => 'nullable|string|max:255',
        ]);

        return ChallengeCitation::create($validated);
    }

    // Mettre à jour une citation
    public function update(Request $request, $id)
    {
        $citation = ChallengeCitation::findOrFail($id);
        
        $validated = $request->validate([
            'theme_id' => 'required|exists:challenge_citations_theme,id',
            'auteur' => 'nullable|string|max:100',
            'citation' => 'required|string',
            'benefice' => 'nullable|string|max:100',
            'musique_url' => 'nullable|string|max:255',
            'video_url' => 'nullable|string|max:255',
        ]);

        $citation->update($validated);
        return $citation;
    }

    // Supprimer une citation
    public function destroy($id)
    {
        $citation = ChallengeCitation::findOrFail($id);
        $citation->delete();
        return response()->json(['message' => 'Citation supprimée avec succès']);
    }
}