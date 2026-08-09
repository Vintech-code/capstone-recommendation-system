<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class AdminCounselorAccountController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        ]);
        $temporaryPassword = Str::password(16, symbols: true);

        $counselor = DB::transaction(function () use ($request, $validated, $temporaryPassword): User {
            $user = User::query()->create([
                'name' => trim($validated['name']),
                'email' => strtolower(trim($validated['email'])),
                'password' => $temporaryPassword,
                'account_status' => 'active',
                'must_change_password' => true,
            ]);
            $role = Role::query()->where('slug', RoleSlug::Counselor->value)->firstOrFail();
            $user->roles()->attach($role);
            $this->audit($request, 'counselor_account.created', $user);

            return $user;
        });

        return response()->json(['data' => [
            ...$this->payload($counselor),
            'temporaryPassword' => $temporaryPassword,
        ]], 201);
    }

    public function update(Request $request, User $counselor): JsonResponse
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
        $this->audit($request, 'counselor_account.updated', $counselor);

        return response()->json(['data' => $this->payload($counselor)]);
    }

    public function resetPassword(Request $request, User $counselor): JsonResponse
    {
        $this->ensureCounselor($counselor);
        $temporaryPassword = Str::password(16, symbols: true);
        $counselor->update(['password' => $temporaryPassword, 'must_change_password' => true]);
        $counselor->tokens()->delete();
        $this->audit($request, 'counselor_account.password_reset', $counselor);

        return response()->json(['data' => [
            ...$this->payload($counselor),
            'temporaryPassword' => $temporaryPassword,
        ]]);
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
