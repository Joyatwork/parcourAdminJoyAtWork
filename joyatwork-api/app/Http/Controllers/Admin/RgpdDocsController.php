<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\RgpdDocument;

class RgpdDocsController extends Controller
{
    public function uploadDocs(Request $request)
    {
        try {
            $request->validate([
                'files.*' => 'required|file|mimes:pdf|max:5120', // max 5MB each
            ]);

            $uploaded = [];

            if ($request->hasFile('files')) {
                $files = $request->file('files');
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $file) {
                    if (!$file->isValid()) continue;
                    $original = $file->getClientOriginalName();
                    $filename = time() . '_' . uniqid() . '_' . preg_replace('/[^A-Za-z0-9_\.-]/', '_', $original);
                    $path = $file->storeAs('public/rgpd_docs', $filename);

                    $doc = RgpdDocument::create([
                        'filename' => $filename,
                        'original_name' => $original,
                        'path' => $path,
                        'uploaded_by' => $request->user()->id ?? null,
                    ]);

                    // build public url (storage link expected)
                    $publicPath = str_replace('public/', 'storage/', $path);
                    $uploaded[] = [
                        'id' => $doc->id,
                        'original_name' => $doc->original_name,
                        'filename' => $doc->filename,
                        'path' => $doc->path,
                        'url' => url($publicPath),
                        'created_at' => $doc->created_at,
                    ];
                }
            }

            return response()->json(['uploaded' => $uploaded]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // log server error
            logger()->error('RGPD upload error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Server error during upload', 'error' => $e->getMessage()], 500);
        }
    }

    public function exportPdf()
    {
        // Not implemented server-side yet
        return response()->json(['message' => 'Server-side PDF export not implemented'], 501);
    }
}
