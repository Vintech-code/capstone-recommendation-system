<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\AcceptAdministratorInvitationRequest;
use App\Services\Admin\AdministratorAccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdministratorInvitationController extends Controller
{
    public function __construct(private readonly AdministratorAccountService $accounts) {}

    public function show(Request $request): JsonResponse
    {
        $validated = $request->validate(['token' => ['required', 'string', 'size:64']]);
        $invitation = $this->accounts->invitation($validated['token']);
        $email = $invitation->email;
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');
        $maskedEmail = mb_substr($local, 0, 1).str_repeat('•', max(3, mb_strlen($local) - 1)).'@'.$domain;

        return response()->json(['data' => [
            'name' => $invitation->name,
            'maskedEmail' => $maskedEmail,
            'expiresAt' => $invitation->expires_at->toIso8601String(),
        ]]);
    }

    public function store(AcceptAdministratorInvitationRequest $request): JsonResponse
    {
        $this->accounts->accept($request->safe()->only(['token', 'password']));

        return response()->json(['data' => ['accepted' => true], 'message' => 'Your Administrator account is ready. Sign in to continue.']);
    }
}
