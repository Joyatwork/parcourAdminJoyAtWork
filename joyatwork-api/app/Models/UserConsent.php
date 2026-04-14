<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class UserConsent extends Model
{
    use HasFactory;

    /**
     * Colonnes autorisées en insertion
     */
    protected $fillable = [
        'user_id',
        'consent_type',
        'granted_at',
        'revoked_at'
    ];

    /**
     * Cast automatique des dates
     */
    protected $casts = [
        'granted_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    /**
     * Ajouter un champ calculé "status"
     */
    protected $appends = ['status'];

    /**
     * Relation : un consentement appartient à un utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Attribut calculé : statut actif ou révoqué
     */
    public function getStatusAttribute()
    {
        return $this->revoked_at ? 'revoked' : 'active';
    }
}