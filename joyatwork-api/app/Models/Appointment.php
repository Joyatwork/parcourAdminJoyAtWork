<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'praticien_id',
        'entreprise_id',
        'service_id',
        'practitioner_id',
        'employee_id',
        'mode',
        'status',
        'scheduled_at',
        'duration',
        'price_cents',
        'is_teleconsultation',
        'created_by',
        'notes'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'is_teleconsultation' => 'boolean',
        'price_cents' => 'integer',
        'duration' => 'integer'
    ];

    public function practitioner()
    {
        return $this->belongsTo(Practitioner::class, 'practitioner_id');
    }
    
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function getClienNameAttribute(){
        if ($this->employee && $this->employee->user) {
            return $this->employee->user->name;
        }
        
        return 'Client inconnu';
    }

    public function getPriceEurosAttribute()
    {
        return $this->price_cents / 100;
    }
}
