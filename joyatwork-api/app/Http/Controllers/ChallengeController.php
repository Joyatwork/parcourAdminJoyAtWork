<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChallengeController extends Controller
{
    public function index()
    {
        $actives = Challenge::with(['category', 'type', 'intensity'])
            ->where('is_active', true)
            ->selectRaw('challenges.*, 
                        (SELECT COUNT(*) FROM challenge_user WHERE challenge_user.challenge_id = challenges.id) as participants_count')
            ->get();

        return response()->json($actives);
    }

    public function trashed()
    {
        $archived = Challenge::with(['category', 'type', 'intensity'])
            ->where('is_active', false)
            ->selectRaw('challenges.*, 
                        (SELECT COUNT(*) FROM challenge_user WHERE challenge_user.challenge_id = challenges.id) as participants_count')
            ->get();

        return response()->json($archived);
    }

    // ARCHIVER
    public function destroy($id)
    {
        $challenge = Challenge::findOrFail($id);
        $challenge->update(['is_active' => false]);
        
        return response()->json(['message' => 'Défi archivé avec succès']);
    }

    // RESTAURER
    public function restore($id)
    {
        $challenge = Challenge::findOrFail($id);
        $challenge->update(['is_active' => true]);

        return response()->json([
            'message' => 'Défi restauré', 
            'challenge' => $challenge
        ]);
    }

    // CRÉER - Accepte FormData
    public function store(Request $request)
    {
        // Valider les données du FormData
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:challenge_category,id',
            'type_id' => 'required|exists:challenge_type,id',
            'points' => 'nullable|integer',
            'duration' => 'nullable|string',
            'intensity_id' => 'required|exists:challenge_intensity,id',
            'objective' => 'nullable|string',
            'pack_thematique' => 'nullable|string',
            'pack_id' => 'nullable|exists:challenge_packs,id',
            'video_path' => 'nullable|string',
        ]);

        // Gestion de l'upload d'image
        if ($request->hasFile('image')) {
            $imageName = time() . '_' . $request->image->getClientOriginalName();
            $imagePath = $request->image->storeAs('challenges', $imageName, 'public');
            $validated['image_path'] = $imagePath; // Stocker le chemin
        }

        $challenge = Challenge::create(array_merge($validated, [
            'is_active' => true,
        ]));

        return response()->json($challenge, 201);
    }

    // MODIFIER - Accepte FormData
    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);

        // Valider les données du FormData
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:challenge_category,id',
            'type_id' => 'required|exists:challenge_type,id',
            'points' => 'nullable|integer',
            'duration' => 'nullable|string',
            'intensity_id' => 'required|exists:challenge_intensity,id',
            'objective' => 'nullable|string',
            'pack_thematique' => 'nullable|string',
            'pack_id' => 'nullable|exists:challenge_packs,id',
            'video_path' => 'nullable|string',
            // Note: 'image' n'est pas dans la validation car c'est un fichier
        ]);

        // Gestion de l'upload d'image
        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe et est stockée localement
            if ($challenge->image_path && Storage::disk('public')->exists($challenge->image_path)) {
                Storage::disk('public')->delete($challenge->image_path);
            }
            
            $imageName = time() . '_' . $request->image->getClientOriginalName();
            $imagePath = $request->image->storeAs('challenges', $imageName, 'public');
            $validated['image_path'] = $imagePath; // Stocker le chemin
        }

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
    public function uploadImage(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);
        
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);
        
        // Supprimer l'ancienne image si elle existe
        if ($challenge->image_path && Storage::disk('public')->exists($challenge->image_path)) {
            Storage::disk('public')->delete($challenge->image_path);
        }
        
        $imageName = time() . '_' . $request->image->getClientOriginalName();
        $imagePath = $request->image->storeAs('challenges', $imageName, 'public');
        
        $challenge->update(['image_path' => $imagePath]);
        
        return response()->json([
            'message' => 'Image uploadée avec succès',
            'image_path' => $imagePath
        ]);
    }
}