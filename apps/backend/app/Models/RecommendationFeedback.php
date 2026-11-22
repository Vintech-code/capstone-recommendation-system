<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'recommendation_run_id', 'programme_id', 'rating', 'comment'])]
class RecommendationFeedback extends Model
{
    protected $table = 'recommendation_feedback';

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<RecommendationRun, $this> */
    public function recommendationRun(): BelongsTo
    {
        return $this->belongsTo(RecommendationRun::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['rating' => 'integer'];
    }
}
