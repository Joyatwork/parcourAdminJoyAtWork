<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChallengeCategory extends Model
{
    use HasFactory;

    protected $table = 'challenge_category'; 
    protected $fillable = ['name']; // allow mass assignment

    // Relationship to challenges
    public function challenges()
    {
        return $this->hasMany(Challenge::class, 'category_id');
    }
}
