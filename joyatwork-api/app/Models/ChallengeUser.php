<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeUser extends Model
{
    protected $table = 'challenge_user';
    
    protected $fillable = [
        'challenge_id',
        'user_id',
        'employee_id',
        'score',
        'rate',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'score' => 'float',
        'rate' => 'float',
    ];
    
}
