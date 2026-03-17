<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComplianceRegistry extends Model
{
    use HasFactory;

    protected $table = 'compliance_registry';

    protected $fillable = [
        'name',
        'purpose',
        'data_type',
        'retention_period'
    ];
}