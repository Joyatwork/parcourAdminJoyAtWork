<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $table = 'entreprises';

    protected $fillable = [
        'name',
        'domain',
        'is_active',
        'adresse_facturation',
        'code_postal',
        'ville',
        'pays',
        'siret',
        'numero_tva',
        'forme_juridique',
        'contact_principal',
        'email_contact',
        'telephone_contact',
        'nombre_employes',
        'secteur_activite',
        'site_web',
        'description',
        'date_premier_contact',
        'source_lead',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'date_premier_contact' => 'date',
        'nombre_employes' => 'integer',
    ];

    /**
     * Contrats liés à cette entreprise
     */
    public function contrats(): HasMany
    {
        return $this->hasMany(Contract::class, 'entreprise_id');
    }

    /**
     * Usages liés à cette entreprise
     */
    public function usages(): HasMany
    {
        return $this->hasMany(Usage::class, 'entreprise_id');
    }
}
