<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use App\Services\Auth\UserSessionRevoker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

final class AdminCounselorAccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        $counselor = DB::transaction(function () use ($request, $validated): User {
            $user = User::query()->create([
                'name' => trim($validated['name']),
                'email' => strtolower(trim($validated['email'])),
                'password' => $validated['password'],
                'account_status' => 'active',
                'must_change_password' => true,
            ]);
            $role = Role::query()->where('slug', RoleSlug::Counselor->value)->firstOrFail();
            $user->roles()->attach($role);
            $this->audit($request, 'counselor_account.created', $user);

            return $user;
        });

        return response()->json(['data' => $this->payload($counselor)], 201);
    }

    public function update(Request $request, User $counselor, UserSessionRevoker $sessions): JsonResponse
    {
        $this->ensureCounselor($counselor);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($counselor->getKey())],
            'accountStatus' => ['required', Rule::in(['active', 'suspended', 'archived'])],
        ]);
        $counselor->update([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'account_status' => $validated['accountStatus'],
            'status_changed_at' => now(),
        ]);
        if ($counselor->account_status !== 'active') {
            $sessions->revoke($counselor);
        }
        $this->audit($request, 'counselor_account.updated', $counselor);

        return response()->json(['data' => $this->payload($counselor)]);
    }

    public function resetPassword(Request $request, User $counselor, UserSessionRevoker $sessions): JsonResponse
    {
        $this->ensureCounselor($counselor);
        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);
        $counselor->update(['password' => $validated['password'], 'must_change_password' => true]);
        $sessions->revoke($counselor);
        $this->audit($request, 'counselor_account.password_reset', $counselor);

        return response()->json(['data' => $this->payload($counselor)]);
    }

    private function ensureCounselor(User $user): void
    {
        abort_unless($user->roles()->where('slug', RoleSlug::Counselor->value)->exists(), 404);
    }

    /** @return array<string, mixed> */
    private function payload(User $user): array
    {
        return [
            'id' => $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'accountStatus' => $user->account_status,
            'mustChangePassword' => (bool) $user->must_change_password,
        ];
    }

    private function audit(Request $request, string $action, User $subject): void
    {
        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => $action,
            'subject_type' => 'counselor_account',
            'subject_reference' => (string) $subject->getKey(),
            'metadata' => ['email' => $subject->email, 'account_status' => $subject->account_status],
        ]);
    }
}
