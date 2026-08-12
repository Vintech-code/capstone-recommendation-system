<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class UserSessionRevoker
{
    public function revoke(User $user, ?string $exceptSessionId = null): void
    {
        $user->tokens()->delete();

        $table = (string) config('session.table', 'sessions');
        if (! Schema::hasTable($table)) {
            return;
        }

        DB::table($table)
            ->where('user_id', $user->getKey())
            ->when($exceptSessionId !== null, static fn ($query) => $query->where('id', '!=', $exceptSessionId))
            ->delete();
    }
}
