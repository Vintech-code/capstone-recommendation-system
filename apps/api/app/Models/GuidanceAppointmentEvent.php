<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'guidance_appointment_id',
    'actor_id',
    'event_type',
    'from_status',
    'to_status',
    'previous_scheduled_at',
    'previous_ends_at',
    'scheduled_at',
    'ends_at',
    'reason',
])]
class GuidanceAppointmentEvent extends Model
{
    public const UPDATED_AT = null;

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(GuidanceAppointment::class, 'guidance_appointment_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    protected function casts(): array
    {
        return [
            'previous_scheduled_at' => 'immutable_datetime',
            'previous_ends_at' => 'immutable_datetime',
            'scheduled_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
            'created_at' => 'immutable_datetime',
        ];
    }
}
