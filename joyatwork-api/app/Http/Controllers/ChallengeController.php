<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function index()
    {
        return response()->json(Challenge::all());
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:255',
                'challenge_type' => 'nullable|string|max:50',
                'points' => 'nullable|integer',
                'duration' => 'nullable|string|max:100',
                'intensity' => 'nullable|string|max:50',
                'objective' => 'nullable|string|max:255'
            ]);

            // Merge default values
            $data = array_merge([
                'participants' => 0,
                'completion_rate' => 0.00,
                'is_active' => true,
            ], $validated);

            $challenge = Challenge::create($data);

            return response()->json($challenge, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'category' => 'sometimes|string',
                'challenge_type' => 'sometimes|string',
                'points' => 'sometimes|integer',
                'duration' => 'sometimes|string',
                'intensity' => 'sometimes|string',
                'is_active' => 'sometimes|boolean'
            ]);

            $challenge = Challenge::findOrFail($id);
            $challenge->update($validated);

            return response()->json($challenge);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $challenge = Challenge::findOrFail($id);
            $challenge->delete(); // This handles soft delete automatically due to SoftDeletes trait in model

            return response()->json(['message' => 'Défi archivé']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function trashed()
    {
        try {
            $trashed = Challenge::onlyTrashed()->get();
            return response()->json($trashed);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {
        try {
            $challenge = Challenge::withTrashed()->findOrFail($id);
            $challenge->restore();

            return response()->json(['message' => 'Défi restauré', 'challenge' => $challenge]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}