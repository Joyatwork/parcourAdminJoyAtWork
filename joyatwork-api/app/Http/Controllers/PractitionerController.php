<?php

namespace App\Http\Controllers;

use App\Models\Practitioner;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PractitionerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Practitioner::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        if ($request->has('specialty') && $request->specialty !== 'all') {
            $query->where('specialty', $request->specialty);
        }

        $practitioners = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $practitioners
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:practitioners,email',
            'phone' => 'nullable|string|max:20',
            'specialty' => 'required|string|max:255', //required mais pour tester
            'experience_years' => 'nullable|integer',
            'rating' => 'nullable|numeric|min:0|max:5',
            'bio' => 'nullable|string',
            'availability' => 'nullable|string',
            'certifications' => 'nullable|string',
        ]);

        $practitioner = Practitioner::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Praticien créé avec succès',
            'data' => $practitioner
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Practitioner $practitioner): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $practitioner
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Practitioner $practitioner): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:practitioners,email,' . $practitioner->id,
            'phone' => 'nullable|string|max:20',
            'specialty' => 'sometimes|required|string|max:255',
            'experience_years' => 'nullable|integer',
            'rating' => 'nullable|numeric|min:0|max:5',
            'bio' => 'nullable|string',
            'availability' => 'nullable|string',
            'certifications' => 'nullable|string',
            'status' => 'nullable|in:active,suspended,inactive',
        ]);

        $practitioner->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Praticien mis à jour avec succès',
            'data' => $practitioner
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Practitioner $practitioner): JsonResponse
    {
        $practitioner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Praticien supprimé avec succès'
        ]);
    }

    /**
     * Suspend a practitioner.
     */
    public function suspend(Request $request, Practitioner $practitioner): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $practitioner->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'suspension_reason' => $request->reason
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Praticien suspendu avec succès',
            'data' => $practitioner
        ]);
    }

    /**
     * Verify a practitioner.
     */
    public function verify(Practitioner $practitioner): JsonResponse
    {
        $practitioner->update([
            'is_verified' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Praticien vérifié avec succès',
            'data' => $practitioner
        ]);
    }
    /**
     * Reactivate a suspended practitioner.
     */
    public function reactivate(Practitioner $practitioner): JsonResponse
    {
        $practitioner->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspension_reason' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Praticien réactivé avec succès',
            'data' => $practitioner
        ]);
    }

    public function verifyCertifIprp(Practitioner $practitioner): JsonResponse
    {
        $practitioner->update([
            'certif_iprp_verified' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Certificat IPRP vérifié avec succès',
            'data' => $practitioner
        ]);
    }

    /**
     * Verify the Master Psy Travail certificate of a practitioner.
     */
    public function verifyMasterPsyTravail(Practitioner $practitioner): JsonResponse
    {
        $practitioner->update([
            'master_psy_travail_verified' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Master Psy Travail vérifié avec succès',
            'data' => $practitioner
        ]);
    }
}
