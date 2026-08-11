<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'recipient_id',
    'event_type',
    'subject_type',
    'subject_reference',
    'deduplication_key',
    'open_key',
    'scheduled_for',
    'status',
    'payload',
    'sent_at',
    'invalidated_at',
])]
class NotificationDispatch extends Model
{
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'scheduled_for' => 'immutable_datetime',
            'sent_at' => 'immutable_datetime',
            'invalidated_at' => 'immutable_datetime',
        ];
    }
}
