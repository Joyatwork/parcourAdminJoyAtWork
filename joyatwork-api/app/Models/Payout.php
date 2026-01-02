<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'practitioner_id',
        'periode_debut',
        'periode_fin',
        'montant_total_ht',
        'nombre_usages',
        'statut',
        'paid_at',
    ];

    protected $casts = [
        'periode_debut' => 'date',
        'periode_fin' => 'date',
        'montant_total_ht' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function lines(): HasMany
    {
        return $this->hasMany(PayoutLine::class);
    }
}

