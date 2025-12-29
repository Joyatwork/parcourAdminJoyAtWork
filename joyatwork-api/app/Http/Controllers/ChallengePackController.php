<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChallengePack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChallengePackController extends Controller
{
    // GET /api/challenge-packs
    public function index()
    {
        $packs = \App\Models\ChallengePack::all();
        return response()->json($packs);
    }

    // GET /api/challenge-packs/{id}
    public function show($id)
    {
        try {
            $pack = ChallengePack::findOrFail($id);
            return response()->json($pack, 200);
        } catch (\Exception $e) {
            Log::error('Error in ChallengePack show: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    // POST /api/challenge-packs
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);

            $pack = ChallengePack::create($validated);

            return response()->json($pack, 201);
            
        } catch (\Exception $e) {
            Log::error('Error in ChallengePack store: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // PUT /api/challenge-packs/{id}
    public function update(Request $request, $id)
    {
        try {
            $pack = ChallengePack::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);

            $pack->update($validated);

            return response()->json($pack, 200);
            
        } catch (\Exception $e) {
            Log::error('Error in ChallengePack update: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // DELETE /api/challenge-packs/{id}
    public function destroy($id)
    {
        try {
            $pack = ChallengePack::findOrFail($id);
            $pack->delete();

            return response()->json(['message' => 'Challenge pack deleted'], 200);
            
        } catch (\Exception $e) {
            Log::error('Error in ChallengePack destroy: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}