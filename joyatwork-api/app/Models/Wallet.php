<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'entreprise_id',
        'balance',
        'devise',
        'is_locked',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_locked' => 'boolean',
    ];

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'entreprise_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }
}

