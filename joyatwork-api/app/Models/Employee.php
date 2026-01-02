<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'company_id',
        'job_title',
        'department',
        'employee_id',
        'hire_date',
        'is_active'
    ];

    protected $casts = [
        'hire_date' => 'datetime',
        'is_active' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    // public function company()
    // {
    //     return $this->belongsTo(Company::class);
    // }
}