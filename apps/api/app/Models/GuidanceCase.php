<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['student_id', 'assigned_to_id', 'status', 'follow_up_on'])]
class GuidanceCase extends Model
{
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(GuidanceNote::class);
    }

    protected function casts(): array
    {
        return ['follow_up_on' => 'date'];
    }
}
