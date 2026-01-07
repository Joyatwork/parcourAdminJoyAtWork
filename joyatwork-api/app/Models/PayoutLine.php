<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayoutLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'payout_id',
        'usage_id',
        'montant_ht',
    ];

    protected $casts = [
        'montant_ht' => 'decimal:2',
    ];

    public function payout(): BelongsTo
    {
        return $this->belongsTo(Payout::class);
    }

    public function usage(): BelongsTo
    {
        return $this->belongsTo(Usage::class);
    }
}

