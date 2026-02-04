<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Practitioner extends Model
{
    protected $table = 'praticiens';
 
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'speciality', 
        'user_id',
        'country',
        'city',
        'postal_code',
        'address',
        'consultation_mode',
        'min_price',
        'max_price',
        'website',
        'linkedin',
        'rpps_number',
        'siret_number',
        'payment_methods',
        'accepts_new_patients',
        'emergency_consultations',
        'availability',
        'languages',
        'specializations',
        'bio',
        'status',
        'suspended_at',
        'suspension_reason',
        'certif_iprp_path',
        'certif_iprp_verified',
        'is_verified',
        'verified_at',
        'verified_by',
        'avatar_url',
        'experience_years',
        'rating',
        'certifications',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'suspended_at' => 'datetime',
        'verified_at' => 'datetime',
        'rating' => 'float',
        'payment_methods' => 'array',
        'languages' => 'array',
        'specializations' => 'array',
        'accepts_new_patients' => 'boolean',
        'emergency_consultations' => 'boolean',
        'certif_iprp_verified' => 'boolean',
        'min_price' => 'decimal:2',
        'max_price' => 'decimal:2',
    ];

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }
}