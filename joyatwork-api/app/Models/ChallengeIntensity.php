<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChallengeIntensity extends Model
{
    use HasFactory;

    protected $table = 'challenge_intensity';
    protected $fillable = ['name']; // allow mass assignment

    // Relationship to challenges
    public function challenges()
    {
        return $this->hasMany(Challenge::class, 'intensity_id');
    }
}
