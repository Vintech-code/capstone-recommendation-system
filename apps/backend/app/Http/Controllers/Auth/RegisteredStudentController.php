<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterStudentRequest;
use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RegisteredStudentController extends Controller
{
    public function store(RegisterStudentRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $role = Role::query()->firstOrCreate(
                ['slug' => RoleSlug::Student->value],
                ['name' => 'Student Applicant'],
            );

            $firstName = trim((string) $request->validated('firstName'));
            $lastName = trim((string) $request->validated('lastName'));
            $user = User::query()->create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'name' => trim($firstName.' '.$lastName),
                'email' => mb_strtolower(trim((string) $request->validated('email'))),
                'password' => $request->validated('password'),
            ]);
            $user->roles()->attach($role);

            return $user;
        });

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Student account created. Check your email to verify your account.',
            'user' => [
                'id' => $user->getKey(),
                'name' => $user->name,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'email' => $user->email,
                'emailVerified' => false,
                'roles' => [RoleSlug::Student->value],
            ],
        ], 201);
    }
}
