<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'entreprise_id',
        'numero_commande',
        'montant_total_ht',
        'montant_total_ttc',
        'statut',
        'date_commande',
    ];

    protected $casts = [
        'montant_total_ht' => 'decimal:2',
        'montant_total_ttc' => 'decimal:2',
        'date_commande' => 'date',
    ];

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'entreprise_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(OrderLine::class);
    }

    public function invoice(): MorphOne
    {
        return $this->morphOne(Invoice::class, 'reference');
    }
}

