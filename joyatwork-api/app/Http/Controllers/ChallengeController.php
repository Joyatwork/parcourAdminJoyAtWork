<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function index()
    {
        $actives = Challenge::where('is_active', true)
            ->selectRaw('challenges.*, 
                        (SELECT COUNT(*) FROM challenge_user WHERE challenge_user.challenge_id = challenges.id) as participants_count')
            ->get();
        
        return response()->json($actives);
    }

     public function trashed()
    {
        $archived = Challenge::where('is_active', false)
            ->selectRaw('challenges.*, 
                        (SELECT COUNT(*) FROM challenge_user WHERE challenge_user.challenge_id = challenges.id) as participants_count')
            ->get();
        
        return response()->json($archived);
    }

    // 3. ARCHIVER (Mettre is_active à 0)
    public function destroy($id)
    {
        $challenge = Challenge::findOrFail($id);
        $challenge->update(['is_active' => false]);
        
        return response()->json(['message' => 'Défi archivé avec succès']);
    }

    // 4. RESTAURER (Mettre is_active à 1)
    public function restore($id)
    {
        $challenge = Challenge::findOrFail($id);
        $challenge->update(['is_active' => true]);

        return response()->json([
            'message' => 'Défi restauré', 
            'challenge' => $challenge
        ]);
    }

    // 5. CRÉER
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string',
            'challenge_type' => 'nullable|string',
            'points' => 'nullable|integer',

            'duration' => 'nullable|string',
            'intensity' => 'nullable|string',
            'objective' => 'nullable|string',
            'pack_thematique' => 'nullable|string',
            'image_path' => 'nullable|string',
            'video_path' => 'nullable|string',
        ]);

        $challenge = Challenge::create(array_merge($validated, [
            'is_active' => true,
            'participants' => 0
        ]));

        return response()->json($challenge, 201);
    }
    // 6. MODIFIER
    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string',
            'challenge_type' => 'nullable|string',
            'points' => 'nullable|integer',
            'duration' => 'nullable|string',
            'intensity' => 'nullable|string',
            'objective' => 'nullable|string',
            'pack_thematique' => 'nullable|string',
            'image_path' => 'nullable|string',
            'video_path' => 'nullable|string',
        ]);

        $challenge->update($validated);

        return response()->json([
            'message' => 'Défi mis à jour avec succès',
            'challenge' => $challenge
        ]);
    }

    public function participantsParDefi($id)
{   
    $sql = "select u.id, u.name, u.email, cu.score, cu.rate
            from users u
            join challenge_user cu on u.id = cu.user_id
            where cu.challenge_id = ?";
    $participants = \DB::select($sql, [$id]);
    return response()->json($participants);
}
    
}