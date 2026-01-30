<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KpiCompanyHealth extends Model
{
    
    protected $table = 'v_global_company_health_v2';

    public $timestamps = false; 

    public $incrementing = false;

}