<?php

namespace App\Http\Controllers;

use App\Models\LibraryContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class LibraryContentController extends Controller
{
    public function index()
    {
        return response()->json(
            LibraryContent::orderByDesc('is_pinned')
                ->orderByDesc('updated_at')
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function show($id)
    {
        return response()->json(LibraryContent::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);
        $validated = $this->handleUploadedFiles($request, $validated);
        $content = LibraryContent::create($validated);

        return response()->json($content, 201);
    }

    public function update(Request $request, $id)
    {
        $content = LibraryContent::findOrFail($id);
        $validated = $this->validatePayload($request);
        $validated = $this->handleUploadedFiles($request, $validated, $content);

        $content->update($validated);

        return response()->json($content);
    }

    public function destroy($id)
    {
        $content = LibraryContent::findOrFail($id);

        $this->deleteStoredFileByUrl($content->file_url);
        $this->deleteStoredFileByUrl($content->thumbnail);
        $this->deleteStoredFileByUrl($content->practitioner_guide);

        foreach (($content->annex_files ?? []) as $annexFile) {
            $this->deleteStoredFileByUrl($annexFile['url'] ?? null);
        }

        $content->delete();

        return response()->json(['message' => 'Contenu supprimé avec succès']);
    }

    private function validatePayload(Request $request): array
    {
        $input = $request->all();

        foreach (['thematic', 'tags', 'annex_files', 'companies', 'feedback', 'collections', 'customization', 'keywords'] as $jsonField) {
            if (isset($input[$jsonField]) && is_string($input[$jsonField])) {
                $decoded = json_decode($input[$jsonField], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $input[$jsonField] = $decoded;
                }
            }
        }

        foreach (['duration', 'views', 'average_watch_time', 'search_boost'] as $intField) {
            if (isset($input[$intField]) && $input[$intField] !== '' && is_string($input[$intField])) {
                $input[$intField] = (int) $input[$intField];
            }
        }

        foreach (['completion_rate', 'rating'] as $floatField) {
            if (isset($input[$floatField]) && $input[$floatField] !== '' && is_string($input[$floatField])) {
                $input[$floatField] = (float) $input[$floatField];
            }
        }

        foreach (['practitioner_only', 'is_pinned', 'is_hot_content', 'has_quiz'] as $boolField) {
            if (isset($input[$boolField])) {
                $input[$boolField] = filter_var($input[$boolField], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
            }
        }

        return Validator::make($input, [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['meditation', 'video', 'audio', 'article', 'challenge', 'tool', 'pdf', 'guide'])],
            'format' => 'nullable|string|max:50',
            'duration' => 'nullable|integer|min:0',
            'thematic' => 'nullable|array',
            'thematic.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'status' => ['nullable', Rule::in(['published', 'draft', 'archived', 'scheduled'])],
            'language' => 'nullable|string|max:20',
            'visibility' => ['nullable', Rule::in(['all', 'practitioners', 'managers', 'hr', 'specific_companies', 'private'])],
            'intensity' => ['nullable', Rule::in(['léger', 'modéré', 'intense'])],
            'level' => ['nullable', Rule::in(['novice', 'habitué', 'expert'])],
            'author' => 'nullable|string|max:255',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date',
            'thumbnail' => 'nullable|string|max:2048',
            'file_url' => 'nullable|string|max:2048',
            'annex_files' => 'nullable|array',
            'annex_files.*.name' => 'required_with:annex_files|string|max:255',
            'annex_files.*.url' => 'required_with:annex_files|string|max:2048',
            'annex_files.*.type' => 'nullable|string|max:100',
            'companies' => 'nullable|array',
            'companies.*' => 'string|max:255',
            'practitioner_only' => 'nullable|boolean',
            'views' => 'nullable|integer|min:0',
            'completion_rate' => 'nullable|numeric|min:0|max:100',
            'average_watch_time' => 'nullable|integer|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'feedback' => 'nullable|array',
            'collections' => 'nullable|array',
            'is_pinned' => 'nullable|boolean',
            'is_hot_content' => 'nullable|boolean',
            'has_quiz' => 'nullable|boolean',
            'practitioner_guide' => 'nullable|string|max:2048',
            'customization' => 'nullable|array',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:100',
            'search_boost' => 'nullable|integer|min:0|max:100',
            'main_file' => 'nullable|file|max:25600',
            'thumbnail_file' => 'nullable|image|max:10240',
            'practitioner_guide_file' => 'nullable|file|max:25600',
            'annex_files_upload' => 'nullable|array',
            'annex_files_upload.*' => 'file|max:25600',
        ])->validate();
    }

    private function handleUploadedFiles(Request $request, array $payload, ?LibraryContent $existingContent = null): array
    {
        $payload['annex_files'] = $this->sanitizeAnnexFilesPayload($payload['annex_files'] ?? ($existingContent?->annex_files ?? []));

        if ($request->hasFile('main_file')) {
            $this->deleteStoredFileByUrl($existingContent?->file_url);
            $storedPath = $request->file('main_file')->store('contents/main', 'public');
            $payload['file_url'] = Storage::url($storedPath);
            $payload['format'] = $request->file('main_file')->getClientOriginalExtension() ?: ($payload['format'] ?? null);
        }

        if ($request->hasFile('thumbnail_file')) {
            $this->deleteStoredFileByUrl($existingContent?->thumbnail);
            $storedPath = $request->file('thumbnail_file')->store('contents/thumbnails', 'public');
            $payload['thumbnail'] = Storage::url($storedPath);
        }

        if ($request->hasFile('practitioner_guide_file')) {
            $this->deleteStoredFileByUrl($existingContent?->practitioner_guide);
            $storedPath = $request->file('practitioner_guide_file')->store('contents/guides', 'public');
            $payload['practitioner_guide'] = Storage::url($storedPath);
        }

        if ($request->hasFile('annex_files_upload')) {
            $existingAnnexFiles = $payload['annex_files'] ?? [];

            foreach ($request->file('annex_files_upload') as $uploadedFile) {
                $storedPath = $uploadedFile->store('contents/annex', 'public');
                $existingAnnexFiles[] = [
                    'name' => $uploadedFile->getClientOriginalName(),
                    'url' => Storage::url($storedPath),
                    'type' => $uploadedFile->getClientMimeType() ?: ($uploadedFile->getClientOriginalExtension() ?: 'file'),
                ];
            }

            $payload['annex_files'] = $existingAnnexFiles;
        }

        unset($payload['main_file'], $payload['thumbnail_file'], $payload['practitioner_guide_file'], $payload['annex_files_upload']);

        return $payload;
    }

    private function deleteStoredFileByUrl(?string $url): void
    {
        if (empty($url)) {
            return;
        }

        if (str_starts_with($url, '/storage/')) {
            $storagePath = substr($url, strlen('/storage/'));
            if (!empty($storagePath) && Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
        }
    }

    private function sanitizeAnnexFilesPayload(array $annexFiles): array
    {
        $sanitized = [];

        foreach ($annexFiles as $annexFile) {
            if (!is_array($annexFile)) {
                continue;
            }

            $name = isset($annexFile['name']) ? trim((string) $annexFile['name']) : '';
            $url = isset($annexFile['url']) ? trim((string) $annexFile['url']) : '';
            $type = isset($annexFile['type']) ? trim((string) $annexFile['type']) : 'file';

            if ($name === '' || $url === '') {
                continue;
            }

            if (str_starts_with($url, 'blob:')) {
                continue;
            }

            if (!(str_starts_with($url, '/storage/') || str_starts_with($url, 'http://') || str_starts_with($url, 'https://'))) {
                continue;
            }

            $sanitized[] = [
                'name' => $name,
                'url' => $url,
                'type' => $type !== '' ? $type : 'file',
            ];
        }

        return array_values($sanitized);
    }
}
