<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ChallengePack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChallengePackController extends Controller
{
    // GET /api/challenge-packs
    public function index()
    {
        // Ajoutez withCount pour compter les défis associés, fallback si la table challenges est manquante
        try {
            $packs = ChallengePack::withCount('challenges')->get();
        } catch (\Throwable $e) {
            Log::warning('ChallengePack index fallback: ' . $e->getMessage());
            $packs = ChallengePack::all();
            $packs->each(function ($p) { $p->challenges_count = 0; });
        }

        return response()->json($packs);
    }

    // GET /api/challenge-packs/{id}
    public function show($id)
    {
        try {
            // Ajoutez aussi withCount pour le show, fallback si erreur
            try {
                $pack = ChallengePack::withCount('challenges')->findOrFail($id);
            } catch (\Throwable $e) {
                Log::warning('ChallengePack show fallback: ' . $e->getMessage());
                $pack = ChallengePack::findOrFail($id);
                $pack->challenges_count = 0;
            }

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

            // Retournez avec le count
            try {
                $result = ChallengePack::withCount('challenges')->find($pack->id);
            } catch (\Throwable $e) {
                Log::warning('ChallengePack store fallback: ' . $e->getMessage());
                $result = ChallengePack::find($pack->id);
                $result->challenges_count = 0;
            }

            return response()->json($result, 201);

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

            // Retournez avec le count
            try {
                $result = ChallengePack::withCount('challenges')->find($id);
            } catch (\Throwable $e) {
                Log::warning('ChallengePack update fallback: ' . $e->getMessage());
                $result = ChallengePack::find($id);
                $result->challenges_count = 0;
            }

            return response()->json($result, 200);

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