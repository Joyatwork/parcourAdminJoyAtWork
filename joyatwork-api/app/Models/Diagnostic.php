<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnostic extends Model
{
    protected $table = 'diagnostics';

    protected $fillable = [
        'user_id',
        'scope',
        'stress_level',
        'energy_level',
        'work_pressure',
        'answers',
        'completed_at',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'completed_at' => 'datetime',
        'answers' => 'json'
    ];
}