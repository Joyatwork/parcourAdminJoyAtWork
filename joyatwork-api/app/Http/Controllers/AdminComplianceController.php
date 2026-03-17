<?php

namespace App\Http\Controllers;

use App\Models\ComplianceRegistry;
use Illuminate\Http\Request;

class AdminComplianceController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplianceRegistry::query();

        if ($request->data_type) {
            $query->where('data_type', $request->data_type);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $registry = ComplianceRegistry::create($request->all());

        return response()->json($registry, 201);
    }
}