<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Practitioner extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'specialty',
        'location',
        'bio',
        'experience_years',
        'rating',
        'certifications',
        'availability',
        'is_verified',
        'status',
        'suspended_at',
        'suspension_reason',
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
        'languages',
        'specializations',
        'certif_iprp_path',
        'certif_iprp_verified',
        'master_psy_travail_path',
        'master_psy_travail_verified'
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'suspended_at' => 'datetime',
        'rating' => 'float',
        'payment_methods' => 'array',
        'languages' => 'array',
        'specializations' => 'array',
        'accepts_new_patients' => 'boolean',
        'emergency_consultations' => 'boolean',
        'certif_iprp_verified' => 'boolean',
        'master_psy_travail_verified' => 'boolean'
    ];

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }
}
