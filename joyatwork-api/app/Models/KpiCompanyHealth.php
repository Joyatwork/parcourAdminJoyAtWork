<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KpiCompanyHealth extends Model
{
    
    protected $table = 'kpi_companies_health';

    public $timestamps = false; 

    protected $fillable = [
        'company_id',
        'year',
        'month',
        'stress_score',
        'energy_score',
        'sleep_score',
        'physical_score',
        'tms_score',
        'satisfaction_score',
        'social_score'
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'created_at' => 'datetime',
    ];

    /**
     * Relation avec l'entreprise
     */
    public function company(): BelongsTo
    {
        // Assure-toi que le modèle s'appelle 'Entreprise' ou 'Company'
        return $this->belongsTo(Company::class, 'company_id');
    }
}