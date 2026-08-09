<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'photo_path', 'strengths', 'growth_areas', 'learning_preferences'])]
class StudentProfile extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'strengths' => 'array',
            'growth_areas' => 'array',
            'learning_preferences' => 'array',
        ];
    }
}
