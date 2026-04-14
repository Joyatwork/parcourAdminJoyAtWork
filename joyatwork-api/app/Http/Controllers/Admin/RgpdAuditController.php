<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RgpdLog;
class RgpdAuditController extends Controller
{
    public function index()
    {
        return RgpdLog::latest()->get();
    }
}
