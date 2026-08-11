<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'previous_session_id',
    'retake_reason',
    'instrument_code',
    'attempt_number',
    'status',
    'is_current',
    'answers',
    'current_question',
    'result_payload',
    'started_at',
    'saved_at',
    'submitted_at',
    'result_available_at',
    'retake_available_at',
    'processing_error_code',
    'processing_failed_at',
])]
class AssessmentSession extends Model
{
    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasOne<RecommendationRun, $this> */
    public function recommendationRun(): HasOne
    {
        return $this->hasOne(RecommendationRun::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'result_payload' => 'array',
            'started_at' => 'datetime',
            'saved_at' => 'datetime',
            'submitted_at' => 'datetime',
            'result_available_at' => 'datetime',
            'retake_available_at' => 'datetime',
            'processing_failed_at' => 'datetime',
            'is_current' => 'boolean',
        ];
    }
}
