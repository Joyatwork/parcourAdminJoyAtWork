<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChallengePack extends Model
{
    use HasFactory;

    protected $table = 'challenge_packs';

    protected $fillable = [
        'name',
        'description',
    ];


    // public function challenges()
    // {
    //     return $this->hasMany(Challenge::class, 'pack_thematique', 'name');
    // }
}

