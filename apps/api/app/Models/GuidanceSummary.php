<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['guidance_case_id', 'author_id', 'body', 'published_by', 'published_at'])]
class GuidanceSummary extends Model
{
    public function guidanceCase(): BelongsTo
    {
        return $this->belongsTo(GuidanceCase::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function publishedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}
