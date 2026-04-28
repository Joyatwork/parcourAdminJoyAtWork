<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LegalDocument;

class LegalDocumentController extends Controller
{
    public function index()
    {
        return LegalDocument::all();
    }

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
}
