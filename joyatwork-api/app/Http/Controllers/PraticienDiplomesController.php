<?php

namespace App\Http\Controllers;

use App\Models\PraticienDiplomes;
use Illuminate\Http\Request;

class PraticienDiplomesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $diplomes = PraticienDiplomes::all();
        return response()->json($diplomes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(PraticienDiplomes $praticienDiplomes)
    {
        
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PraticienDiplomes $praticienDiplomes)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'chemin_fichier' => 'sometimes|string|max:255',
            'verifie' => 'sometimes|boolean',
        ]);
        $praticienDiplomes->update($validated);
        return response()->json(['message' => 'Diplome mise à jour avec succès', 'diplome' => $praticienDiplomes]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PraticienDiplomes $praticienDiplomes)
    {
        $praticienDiplomes->delete();
        return response()->json(['message' => 'Diplome supprimée avec succès']);
    }

    public function getDiplomesByPraticien($praticienId)
    {
        $diplomes = PraticienDiplomes::where('praticien_id', $praticienId)->get();
        return response()->json($diplomes);
    }

    public function verifier_diplome($id)
    {
        $diplome = PraticienDiplomes::find($id);
        if (!$diplome) {
            return response()->json(['message' => 'Diplome non trouvée'], 404);
        }
        $diplome->verifie = 1;
        $diplome->save();
        return response()->json(['message' => 'Diplome vérifiée avec succès', 'diplome' => $diplome]);
    }
    public function deverifier_diplome($id)
    {
        $diplome = PraticienDiplomes::find($id);
        if (!$diplome) {
            return response()->json([
                'success' => false,
                'error' => 'Diplome non trouvée'
            ], 404);
        }
        
        $diplome->verifie = 0;
        $diplome->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Diplome dévérifiée avec succès',
            'data' => $diplome
        ]);
    }
}
