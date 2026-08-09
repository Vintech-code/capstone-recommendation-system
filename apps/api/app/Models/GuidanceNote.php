<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['guidance_case_id', 'author_id', 'body'])]
class GuidanceNote extends Model
{
    public function guidanceCase(): BelongsTo
    {
        return $this->belongsTo(GuidanceCase::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
