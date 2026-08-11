<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['counselor_id', 'weekday', 'starts_at', 'ends_at', 'timezone'])]
class CounselorAvailabilityWindow extends Model
{
    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }

    protected function casts(): array
    {
        return ['weekday' => 'integer'];
    }
}
