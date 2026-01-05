<?php

namespace App\Http\Controllers;

use App\Models\PraticienCertifications;
use Illuminate\Http\Request;

class PraticienCertificationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $certifications = PraticienCertifications::all();
        return response()->json($certifications);
    }

    public function getCertificationsByPraticien($praticienId)
    {
        $diplomes = PraticienCertifications::where('praticien_id', $praticienId)->get();
        return response()->json($diplomes);
    }

    public function verifier_certification($id)
    {
        $certification = PraticienCertifications::find($id);
        if (!$certification) {
            return response()->json(['message' => 'Certification non trouvée'], 404);
        }
        $certification->verifie = 1;
        $certification->save();
        return response()->json(['message' => 'Certification vérifiée avec succès', 'certification' => $certification]);

    }

    public function deverifier_certfification($id)
    {
        $certification = PraticienCertifications::find($id);
        if (!$certification) {
            return response()->json([
                'success' => false,
                'error' => 'Diplome non trouvée'
            ], 404);
        }
        
        $certification->verifie = 0;
        $certification->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Diplome dévérifiée avec succès',
            'data' => $certification
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
    public function show(PraticienCertifications $praticienCertifications)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PraticienCertifications $praticienCertifications)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PraticienCertifications $praticienCertifications)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PraticienCertifications $praticienCertifications)
    {
        //
    }
}
