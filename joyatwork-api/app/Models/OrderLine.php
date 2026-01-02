<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'type_service',
        'quantite',
        'prix_unitaire_ht',
        'montant_ligne_ht',
        'part_joyatwork_pct',
        'part_praticien_pct',
    ];

    protected $casts = [
        'quantite' => 'integer',
        'prix_unitaire_ht' => 'decimal:2',
        'montant_ligne_ht' => 'decimal:2',
        'part_joyatwork_pct' => 'decimal:2',
        'part_praticien_pct' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function credits(): HasMany
    {
        return $this->hasMany(Credit::class);
    }
}

