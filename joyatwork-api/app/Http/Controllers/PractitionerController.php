<?php

namespace App\Http\Controllers;

use App\Models\Practitioner;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PractitionerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Practitioner::query();

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('speciality', 'like', "%{$search}%");
                });
            }

            if ($request->has('speciality') && $request->speciality !== 'all') {
                $query->where('speciality', $request->speciality);
            }

            $practitionersData = [];
            foreach ($query->orderBy('created_at', 'desc')->get() as $practitioner) {
                $practitionersData[] = $this->mapToFrontend($practitioner);
            }

            return response()->json([
                'success' => true,
                'data' => $practitionersData
            ]);
        } catch (\Throwable $e) {
            Log::error('Error in Practitioner index: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:praticiens,email',
                'phone' => 'nullable|string|max:255',
                'speciality' => 'nullable|string|max:255',  
                'country' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:255',
                'consultation_mode' => 'nullable|string|max:30',
                'min_price' => 'nullable|numeric|min:0',
                'max_price' => 'nullable|numeric|min:0',
                'website' => 'nullable|url|max:255',
                'linkedin' => 'nullable|url|max:255',
                'rpps_number' => 'nullable|string|max:50',
                'siret_number' => 'nullable|string|max:50',
                'payment_methods' => 'nullable|array',
                'languages' => 'nullable|array',
                'specializations' => 'nullable|array',
                'availability' => 'nullable|string',
                'bio' => 'nullable|string',
                'experience_years' => 'nullable|integer|min:0|max:80',
                'certifications' => 'nullable|string',
            ]);
            
            // Add default values for required DB fields
            $validated['status'] = 'active';
            $validated['accepts_new_patients'] = 1;
            $validated['emergency_consultations'] = 0;
            $validated['consultation_mode'] = 'both';
            $validated['user_id'] = $request->user_id ?? 1;

            $practitioner = Practitioner::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Praticien créé avec succès',
                'data' => $this->mapToFrontend($practitioner)
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating practitioner: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Practitioner $practitioner): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->mapToFrontend($practitioner)
            ]);
        } catch (\Throwable $e) {
            Log::error('Error in Practitioner show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Praticien non trouvé'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Practitioner $practitioner): JsonResponse
    {
        // Just update whatever fields are sent - no strict validation
        $data = $request->only([
            'first_name', 'last_name', 'phone', 'speciality',
            'country', 'city', 'postal_code', 'address',
            'consultation_mode', 'bio', 'availability',
            'website', 'linkedin', 'rpps_number', 'siret_number',
            'min_price', 'max_price', 'payment_methods',
            'accepts_new_patients', 'emergency_consultations',
            'languages', 'specializations',
        ]);

        // Convert arrays to JSON
        if (isset($data['payment_methods']) && is_array($data['payment_methods'])) {
            $data['payment_methods'] = json_encode($data['payment_methods']);
        }
        if (isset($data['languages']) && is_array($data['languages'])) {
            $data['languages'] = json_encode($data['languages']);
        }
        if (isset($data['specializations']) && is_array($data['specializations'])) {
            $data['specializations'] = json_encode($data['specializations']);
        }

        $practitioner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Praticien mis à jour avec succès',
            'data' => $this->mapToFrontend($practitioner->fresh())
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Practitioner $practitioner): JsonResponse
    {
        try {
            $practitioner->delete();

            return response()->json([
                'success' => true,
                'message' => 'Praticien supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting practitioner: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspend a practitioner.
     */
    public function suspend(Request $request, Practitioner $practitioner): JsonResponse
    {
        try {
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
                'data' => $this->mapToFrontend($practitioner)
            ]);
        } catch (\Exception $e) {
            Log::error('Error suspending practitioner: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify a practitioner.
     */
    public function verify(Practitioner $practitioner): JsonResponse
    {
        try {
            $practitioner->update([
                'is_verified' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Praticien vérifié avec succès',
                'data' => $this->mapToFrontend($practitioner)
            ]);
        } catch (\Exception $e) {
            Log::error('Error verifying practitioner: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Reactivate a suspended practitioner.
     */
    public function reactivate(Practitioner $practitioner): JsonResponse
    {
        try {
            $practitioner->update([
                'status' => 'active',
                'suspended_at' => null,
                'suspension_reason' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Praticien réactivé avec succès',
                'data' => $this->mapToFrontend($practitioner)
            ]);
        } catch (\Exception $e) {
            Log::error('Error reactivating practitioner: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyCertifIprp(Practitioner $practitioner): JsonResponse
    {
        try {
            $practitioner->update([
                'certif_iprp_verified' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Certificat IPRP vérifié avec succès',
                'data' => $this->mapToFrontend($practitioner)
            ]);
        } catch (\Exception $e) {
            Log::error('Error verifying IPRP certificate: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify the Master Psy Travail certificate of a practitioner.
     */
    public function verifyMasterPsyTravail(Practitioner $practitioner): JsonResponse
    {
        try {
            $practitioner->update([
                'master_psy_travail_verified' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Master Psy Travail vérifié avec succès',
                'data' => $this->mapToFrontend($practitioner)
            ]);
        } catch (\Exception $e) {
            Log::error('Error verifying Master Psy Travail: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function mapToFrontend(Practitioner $practitioner): array
    {
        $locationParts = array_filter([
            $practitioner->address,
            $practitioner->city,
            $practitioner->postal_code,
            $practitioner->country,
        ]);

        return [
            'id' => $practitioner->id,
            'first_name' => $practitioner->first_name,
            'last_name' => $practitioner->last_name,
            'email' => $practitioner->email ?? '',
            'phone' => $practitioner->phone ?? '',
            'speciality' => $practitioner->speciality ?? 'Spécialité non définie',
            'location' => empty($locationParts) ? 'Localisation non définie' : implode(', ', $locationParts),
            'bio' => $practitioner->bio,
            'experience_years' => $practitioner->experience_years ?? 0,
            'rating' => $practitioner->rating ?? 0,
            'certifications' => $practitioner->certifications ?? '',
            'availability' => $practitioner->availability ?? '',
            'is_verified' => $practitioner->is_verified ?? false,
            'status' => $practitioner->status ?? 'active',
            'suspended_at' => $practitioner->suspended_at,
            'suspension_reason' => $practitioner->suspension_reason,
            'country' => $practitioner->country,
            'city' => $practitioner->city,
            'postal_code' => $practitioner->postal_code,
            'address' => $practitioner->address,
            'consultation_mode' => $practitioner->consultation_mode,
            'min_price' => $practitioner->min_price,
            'max_price' => $practitioner->max_price,
            'website' => $practitioner->website,
            'linkedin' => $practitioner->linkedin,
            'rpps_number' => $practitioner->rpps_number,
            'siret_number' => $practitioner->siret_number,
            'payment_methods' => $practitioner->payment_methods ?? [],
            'accepts_new_patients' => $practitioner->accepts_new_patients ?? false,
            'emergency_consultations' => $practitioner->emergency_consultations ?? false,
            'languages' => $practitioner->languages ?? [],
            'specializations' => $practitioner->specializations ?? [],
            'certif_iprp_path' => $practitioner->certif_iprp_path,
            'certif_iprp_verified' => $practitioner->certif_iprp_verified ?? false,
            'created_at' => $practitioner->created_at,
            'updated_at' => $practitioner->updated_at,
        ];
    }
}
