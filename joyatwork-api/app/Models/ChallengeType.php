<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeType extends Model
{
    protected $table = 'challenge_type';
    
    protected $fillable = [
        'name',
    ];

    public function challenges()
    {
        return $this->hasMany(Challenge::class, 'type_id');
    }
}
