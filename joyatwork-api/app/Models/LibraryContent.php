<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryContent extends Model
{
    protected $table = 'library_contents';

    protected $fillable = [
        'title',
        'description',
        'type',
        'format',
        'duration',
        'thematic',
        'tags',
        'status',
        'language',
        'visibility',
        'intensity',
        'level',
        'author',
        'published_at',
        'scheduled_at',
        'thumbnail',
        'file_url',
        'annex_files',
        'companies',
        'practitioner_only',
        'views',
        'completion_rate',
        'average_watch_time',
        'rating',
        'feedback',
        'collections',
        'is_pinned',
        'is_hot_content',
        'has_quiz',
        'practitioner_guide',
        'customization',
        'keywords',
        'search_boost',
    ];

    protected $casts = [
        'thematic' => 'array',
        'tags' => 'array',
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'annex_files' => 'array',
        'companies' => 'array',
        'practitioner_only' => 'boolean',
        'views' => 'integer',
        'completion_rate' => 'float',
        'average_watch_time' => 'integer',
        'rating' => 'float',
        'feedback' => 'array',
        'collections' => 'array',
        'is_pinned' => 'boolean',
        'is_hot_content' => 'boolean',
        'has_quiz' => 'boolean',
        'customization' => 'array',
        'keywords' => 'array',
        'search_boost' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
