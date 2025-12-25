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
        'completion_rate',
        'pack_thematique',
        'image_path',
        'video_path',
        
    ];

    protected $casts = [
    'is_active' => 'boolean',
    'points' => 'integer',
    'participants' => 'integer',
    'completion_rate' => 'float',
    
    // Move your dates here!
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
    'deleted_at' => 'datetime',
    ];

}