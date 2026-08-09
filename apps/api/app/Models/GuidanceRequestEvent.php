<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['guidance_request_id', 'actor_id', 'event_type', 'from_status', 'to_status', 'reason'])]
class GuidanceRequestEvent extends Model
{
    public const UPDATED_AT = null;

    public function request(): BelongsTo
    {
        return $this->belongsTo(GuidanceRequest::class, 'guidance_request_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    protected function casts(): array
    {
        return ['created_at' => 'immutable_datetime'];
    }
}
