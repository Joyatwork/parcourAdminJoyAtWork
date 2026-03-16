<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class QuestionnaireTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            QuestionnaireTemplate::orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'sections'    => 'required|array',
            'created_by_user_id' => 'nullable|integer|min:1',
            'created_by_name'    => 'nullable|string|max:255',
        ]);

        $template = QuestionnaireTemplate::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? '',
            'sections'    => $validated['sections'],
            'usage_count' => 0,
            'archived'    => false,
            'created_by_user_id' => $validated['created_by_user_id'] ?? null,
            'created_by_name'    => $validated['created_by_name'] ?? null,
        ]);

        return response()->json($template, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $template = QuestionnaireTemplate::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'sections'    => 'sometimes|array',
            'archived'    => 'sometimes|boolean',
            'usage_count' => 'sometimes|integer|min:0',
        ]);

        $template->update($validated);

        return response()->json($template);
    }

    public function destroy(int $id): JsonResponse
    {
        QuestionnaireTemplate::findOrFail($id)->delete();
        return response()->json(['message' => 'Supprimé avec succès.']);
    }

    public function duplicate(Request $request, int $id): JsonResponse
    {
        $original = QuestionnaireTemplate::findOrFail($id);

        $validated = $request->validate([
            'created_by_user_id' => 'nullable|integer|min:1',
            'created_by_name'    => 'nullable|string|max:255',
        ]);

        $duplicate = QuestionnaireTemplate::create([
            'name'        => $original->name . ' (copie)',
            'description' => $original->description,
            'sections'    => $original->sections,
            'usage_count' => 0,
            'archived'    => false,
            'created_by_user_id' => $validated['created_by_user_id'] ?? $original->created_by_user_id,
            'created_by_name'    => $validated['created_by_name'] ?? $original->created_by_name,
        ]);

        return response()->json($duplicate, 201);
    }
}
