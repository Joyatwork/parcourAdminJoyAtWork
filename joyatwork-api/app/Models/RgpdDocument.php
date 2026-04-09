<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RgpdDocument extends Model
{
    protected $table = 'rgpd_documents';

    protected $fillable = [
        'filename',
        'original_name',
        'path',
        'uploaded_by',
    ];
}
