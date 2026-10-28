<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['kind', 'version', 'status', 'academic_year', 'payload', 'created_by', 'published_by', 'published_at'])]
class ConfigurationVersion extends Model
{
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    protected function casts(): array
    {
        return ['payload' => 'array', 'published_at' => 'immutable_datetime'];
    }
}
