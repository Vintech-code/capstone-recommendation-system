<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'score',
    'eligibility_group',
    'rule_reference',
    'declared_at',
    'superseded_at',
])]
class EntranceExaminationResult extends Model
{
    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<AssessmentSession, $this> */
    public function assessmentSessions(): HasMany
    {
        return $this->hasMany(AssessmentSession::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'score' => 'decimal:1',
            'declared_at' => 'immutable_datetime',
            'superseded_at' => 'immutable_datetime',
        ];
    }
}
