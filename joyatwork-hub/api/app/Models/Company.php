<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sector',
        'location',
        'employees',
        'phone',
        'email',
        'website',
        'description',
        'wellness_programs',
        'status',
        'contract_value',
        'verified'
    ];

    protected $casts = [
        'wellness_programs' => 'array',
        'verified' => 'boolean',
        'contract_value' => 'decimal:2'
    ];

    // Accesseur pour formater le nombre d'employés
    public function getFormattedEmployeesAttribute()
    {
        return number_format($this->employees);
    }

    // Accesseur pour formater la valeur du contrat
    public function getFormattedContractValueAttribute()
    {
        return number_format($this->contract_value, 0, ',', ' ') . '€';
    }

    // Scope pour les entreprises actives
    public function scopeActive($query)
    {
        return $query->where('status', 'Actif');
    }

    // Scope pour les entreprises vérifiées
    public function scopeVerified($query)
    {
        return $query->where('verified', true);
    }
}
