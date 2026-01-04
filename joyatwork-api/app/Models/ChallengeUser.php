<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeUser extends Model
{
    protected $table = 'challenge_user';
    
    protected $fillable = [
        'challenge_id',
        'user_id',
        'score',
        'rate',
    ];
    
}
