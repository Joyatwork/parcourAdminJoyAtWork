<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    /**
     * Cette API utilise la table existante `entreprises` (schéma historique).
     */
    protected $table = 'entreprises';

    protected $fillable = [
        'name',
        'industry',
        'siret',
        'address',
        'city',
        'postal_code',
        'country',
        'email',
        'phone',
        'website',
    ];
}
