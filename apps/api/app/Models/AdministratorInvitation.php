<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'email', 'pending_email', 'token_hash', 'can_manage_administrators', 'invited_by', 'expires_at', 'sent_at', 'accepted_at', 'revoked_at'])]
class AdministratorInvitation extends Model
{
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function isPending(): bool
    {
        return $this->accepted_at === null && $this->revoked_at === null && $this->expires_at->isFuture();
    }

    protected function casts(): array
    {
        return [
            'can_manage_administrators' => 'boolean',
            'expires_at' => 'datetime',
            'sent_at' => 'datetime',
            'accepted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }
}
