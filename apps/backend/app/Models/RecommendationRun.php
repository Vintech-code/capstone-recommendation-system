<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'assessment_session_id',
    'catalogue_reference',
    'rule_reference',
    'entrance_examination_snapshot',
    'methodology_status',
    'default_count',
    'total_eligible',
    'ranked_courses',
    'unranked_programmes',
    'generated_at',
])]
class RecommendationRun extends Model
{
    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<AssessmentSession, $this> */
    public function assessmentSession(): BelongsTo
    {
        return $this->belongsTo(AssessmentSession::class);
    }

    /** @return HasMany<RecommendationFeedback, $this> */
    public function feedback(): HasMany
    {
        return $this->hasMany(RecommendationFeedback::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'ranked_courses' => 'array',
            'unranked_programmes' => 'array',
            'entrance_examination_snapshot' => 'array',
            'generated_at' => 'immutable_datetime',
        ];
    }
}
