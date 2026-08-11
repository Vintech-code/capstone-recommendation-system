<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['reference', 'source_url', 'source_name', 'last_verified_at', 'verified_by'])]
class ProgrammeSourceRecord extends Model
{
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    protected function casts(): array
    {
        return ['last_verified_at' => 'immutable_date'];
    }
}
