<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LegalDocument;
use Illuminate\Support\Facades\Storage;

class LegalDocumentController extends Controller
{
    // 🔹 Liste des documents
    public function index()
    {
        return LegalDocument::all();
    }

    // 🔹 Upload d’un nouveau document
    public function upload(Request $request)
    {
        $request->validate([
            'document' => 'required|mimes:pdf|max:50000',
        ]);

        $file = $request->file('document');
        $path = $file->store('legal-documents', 'public');

        $doc = LegalDocument::create([
            'name' => $file->getClientOriginalName(),
            'file_url' => 'storage/' . $path,
        ]);

        return response()->json($doc);
    }

    // 🔹 Modifier un document existant
    public function update(Request $request, $id)
    {
        $request->validate([
            'document' => 'required|mimes:pdf|max:50000',
        ]);

        $doc = LegalDocument::findOrFail($id);

        // Supprimer l’ancien fichier
        $oldPath = str_replace('storage/', '', $doc->file_url);
        Storage::disk('public')->delete($oldPath);

        // Upload du nouveau fichier
        $file = $request->file('document');
        $path = $file->store('legal-documents', 'public');

        $doc->update([
            'name' => $file->getClientOriginalName(),
            'file_url' => 'storage/' . $path,
        ]);

        return response()->json($doc);
    }

    // 🔹 Supprimer un document
    public function destroy($id)
    {
        $doc = LegalDocument::findOrFail($id);

        // Supprimer le fichier physique
        $path = str_replace('storage/', '', $doc->file_url);
        Storage::disk('public')->delete($path);

        // Supprimer en base
        $doc->delete();

        return response()->json(['message' => 'Document supprimé']);
    }
}
