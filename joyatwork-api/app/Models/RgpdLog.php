<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RgpdLog extends Model
{
     protected $fillable = [
        'action',
        'user_id',
        'admin_email'
    ];
    //
}
