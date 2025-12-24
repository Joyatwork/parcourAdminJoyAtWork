<?php
// app/Models/Challenge.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Challenge extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'category',
        'challenge_type',
        'points',
        'duration',
        'intensity',
        'objective',
        'is_active',
        'participants',
        'completion_rate'
        // Retirez 'contents' et 'statistics' si vous ne les utilisez pas
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'points' => 'integer',
        'participants' => 'integer',
        'completion_rate' => 'float'
        // Retirez 'contents' => 'array', et 'statistics' => 'array', si problématique
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];
}