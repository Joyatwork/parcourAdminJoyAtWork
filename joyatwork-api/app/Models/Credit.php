<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Credit extends Model
{
    use HasFactory;

    protected $fillable = [
        'entreprise_id',
        'order_line_id',
        'type_service',
        'quantite_initiale',
        'quantite_restante',
        'date_expiration',
    ];

    protected $casts = [
        'quantite_initiale' => 'integer',
        'quantite_restante' => 'integer',
        'date_expiration' => 'date',
    ];

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'entreprise_id');
    }

    public function orderLine(): BelongsTo
    {
        return $this->belongsTo(OrderLine::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(Usage::class);
    }
}

