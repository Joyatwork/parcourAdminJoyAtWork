<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PraticienCertifications extends Model
{
    protected $table = 'praticien_certifications';

    protected $fillable = [
        'praticien_id',
        'nom',
        'chemin_fichier',
        'verifie',
    ];
    protected $casts = [
        'verifie' => 'boolean',
    ];

    public function praticien()
    {
        return $this->belongsTo(Practitioner::class, 'praticien_id');
    }
}
