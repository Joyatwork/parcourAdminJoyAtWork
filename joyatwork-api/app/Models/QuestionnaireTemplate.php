<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionnaireTemplate extends Model
{
    protected $table = 'questionnaire_templates';

    protected $fillable = [
        'name',
        'description',
        'sections',
        'usage_count',
        'archived',
        'created_by_user_id',
        'created_by_name',
    ];

    protected $casts = [
        'sections'    => 'array',
        'archived'    => 'boolean',
        'usage_count' => 'integer',
        'created_by_user_id' => 'integer',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];
}
