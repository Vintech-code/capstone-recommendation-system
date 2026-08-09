<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['student_id', 'programme_id', 'concern_category', 'message', 'preferred_format', 'preferred_date', 'status', 'accepted_by', 'accepted_at', 'appointment_id', 'closed_at', 'resolution_reason'])]
class GuidanceRequest extends Model
{
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(GuidanceAppointment::class, 'appointment_id');
    }

    public function acceptedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(GuidanceRequestEvent::class)->oldest('created_at')->oldest('id');
    }

    protected function casts(): array
    {
        return [
            'preferred_date' => 'date',
            'accepted_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
