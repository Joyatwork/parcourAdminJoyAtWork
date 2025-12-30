<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeCitation extends Model
{
    protected $table = 'challenge_citations';

    protected $fillable = [
        'theme_id',
        'auteur',
        'citation',
        'benefice',
        'musique_url',
        'video_url',
    ];

    public $timestamps = false;

    // Une citation appartient à un thème
    public function theme()
    {
        return $this->belongsTo(ChallengeCitationTheme::class, 'theme_id');
    }
}
