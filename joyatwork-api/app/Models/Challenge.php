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
        'category_id',
        'type_id',
        'intensity_id',
        'points',
        'duration',
        'objective',
        'is_active',
        'participants',
        'completion_rate',
        'pack_thematique',
        'pack_id',
        'image_path',
        'video_path',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'points' => 'integer',
        'participants' => 'integer',
        'completion_rate' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function category() {
        return $this->belongsTo(ChallengeCategory::class, 'category_id');
    }

    public function type() {
        return $this->belongsTo(ChallengeType::class, 'type_id');
    }

    public function intensity() {
        return $this->belongsTo(ChallengeIntensity::class, 'intensity_id');
    }

    public function pack() {
        return $this->belongsTo(ChallengePack::class, 'pack_id');
    }
}