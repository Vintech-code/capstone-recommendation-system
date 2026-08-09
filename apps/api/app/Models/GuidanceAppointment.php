<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['student_id', 'counselor_id', 'created_by', 'scheduled_at', 'ends_at', 'topic', 'programme_code', 'status', 'notes', 'cancellation_reason', 'student_confirmed_at'])]
class GuidanceAppointment extends Model
{
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function events(): HasMany
    {
        return $this->hasMany(GuidanceAppointmentEvent::class)->oldest('created_at')->oldest('id');
    }

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime', 'ends_at' => 'datetime', 'student_confirmed_at' => 'datetime'];
    }
}
