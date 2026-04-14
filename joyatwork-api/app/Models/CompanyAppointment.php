<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyAppointment extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $table = 'company_appointments';

    protected $fillable = [
        'entreprise_id',
        'scheduled_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];
}
