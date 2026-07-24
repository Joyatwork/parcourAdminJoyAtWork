<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory;

    /**
     * Utiliser la table 'contrats'
     */
    // Le schéma de migration crée la table 'contracts' (anglais).
    // Aligner le modèle sur le schéma existant pour éviter les erreurs SQL.
    protected $table = 'contracts';

    /**
     * Champs modifiables
     */
    protected $fillable = [
        'entreprise_id',
        'numero_contrat',
        'type_contrat',
        'statut',
        'date_debut',
        'date_fin',
        'date_signature',
        'date_renouvellement',
        'montant_annuel',
        'montant_mensuel',
        'devise',
        'description',
        'conditions_particulieres',
        'nombre_employes_couverts',
    ];

    /**
     * Casts automatiques
     */
    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'date_signature' => 'date',
        'date_renouvellement' => 'date',
        'montant_annuel' => 'decimal:2',
        'montant_mensuel' => 'decimal:2',
        'nombre_employes_couverts' => 'integer',
    ];

    /**
     * Entreprise liée au contrat
     */
    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'entreprise_id');
    }
}

