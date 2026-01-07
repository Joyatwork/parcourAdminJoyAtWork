<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeCitationTheme extends Model
{
    protected $table = 'challenge_citations_theme';

    protected $fillable = [
        'theme',
    ];

    public $timestamps = false;

    // Un thème a plusieurs citations
    public function citations()
    {
        return $this->hasMany(ChallengeCitation::class, 'theme_id');
    }
}
