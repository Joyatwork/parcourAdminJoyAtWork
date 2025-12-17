<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    /**
     * Utiliser la table existante 'entreprises'
     */
    protected $table = 'entreprises';

    /**
     * Colonnes modifiables adaptées à la structure réelle
     * supposée : id, name, domain, is_active, created_at, updated_at
     */
    protected $fillable = [
        'name',
        'domain',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Contrats liés à cette entreprise
     */
    public function contrats(): HasMany
    {
        return $this->hasMany(Contract::class, 'entreprise_id');
    }
}
