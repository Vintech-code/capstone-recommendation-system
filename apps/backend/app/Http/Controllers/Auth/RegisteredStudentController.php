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

            $user = User::query()->create($request->safe()->only([
                'name',
                'email',
                'password',
            ]));
            $user->roles()->attach($role);

            return $user;
        });

        return response()->json([
            'message' => 'Student account created.',
            'user' => [
                'id' => $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
                'roles' => [RoleSlug::Student->value],
            ],
        ], 201);
    }
}
