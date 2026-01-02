<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Usage extends Model
{
    use HasFactory;

    protected $fillable = [
        'entreprise_id',
        'employee_id',
        'practitioner_id',
        'order_line_id',
        'credit_id',
        'type_service',
        'date_prestation',
        'prix_ht',
        'part_joyatwork_ht',
        'part_praticien_ht',
        'statut',
        'validated_by',
        'validated_at',
    ];

    protected $casts = [
        'date_prestation' => 'date',
        'prix_ht' => 'decimal:2',
        'part_joyatwork_ht' => 'decimal:2',
        'part_praticien_ht' => 'decimal:2',
        'validated_at' => 'datetime',
    ];

    public function entreprise(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'entreprise_id');
    }

    public function orderLine(): BelongsTo
    {
        return $this->belongsTo(OrderLine::class);
    }

    public function credit(): BelongsTo
    {
        return $this->belongsTo(Credit::class);
    }
}

