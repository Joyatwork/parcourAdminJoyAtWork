<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'entreprise_id',
        'type',
        'reference_type',
        'reference_id',
        'numero_facture',
        'montant_ht',
        'montant_ttc',
        'taux_tva',
        'statut',
        'date_emission',
        'due_date',
        'paid_at',
    ];

    protected $casts = [
        'montant_ht' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'taux_tva' => 'decimal:2',
        'date_emission' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'entreprise_id');
    }

    /**
    * Polymorphic link to Order | Recharge (future)
    */
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}

