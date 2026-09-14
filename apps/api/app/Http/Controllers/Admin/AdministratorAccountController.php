<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfirmAdministratorActionRequest;
use App\Http\Requests\Admin\InviteAdministratorRequest;
use App\Http\Requests\Admin\UpdateAdministratorPermissionRequest;
use App\Http\Requests\Admin\UpdateAdministratorStatusRequest;
use App\Models\AdministratorInvitation;
use App\Models\User;
use App\Services\Admin\AdministratorAccountService;
use Illuminate\Http\JsonResponse;

class AdministratorAccountController extends Controller
{
    public function __construct(private readonly AdministratorAccountService $accounts) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->accounts->index()]);
    }

    public function store(InviteAdministratorRequest $request): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $invitation = $this->accounts->invite($actor, $request->validated());

        return response()->json(['data' => $this->accounts->invitationPayload($invitation)], 201);
    }

    public function resend(ConfirmAdministratorActionRequest $request, AdministratorInvitation $administratorInvitation): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $invitation = $this->accounts->resend($actor, $administratorInvitation, $request->string('currentPassword')->toString());

        return response()->json(['data' => $this->accounts->invitationPayload($invitation)]);
    }

    public function revoke(ConfirmAdministratorActionRequest $request, AdministratorInvitation $administratorInvitation): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $this->accounts->revokeInvitation($actor, $administratorInvitation, $request->string('currentPassword')->toString(), $request->string('reason')->toString());

        return response()->json(['data' => ['revoked' => true]]);
    }

    public function status(UpdateAdministratorStatusRequest $request, User $administrator): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $updated = $this->accounts->updateStatus($actor, $administrator, $request->string('status')->toString(), $request->string('currentPassword')->toString(), $request->string('reason')->toString());

        return response()->json(['data' => ['id' => $updated->getKey(), 'accountStatus' => $updated->account_status]]);
    }

    public function permission(UpdateAdministratorPermissionRequest $request, User $administrator): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $updated = $this->accounts->updatePermission($actor, $administrator, $request->boolean('canManageAdministrators'), $request->string('currentPassword')->toString(), $request->string('reason')->toString());

        return response()->json(['data' => ['id' => $updated->getKey(), 'canManageAdministrators' => (bool) $updated->can_manage_administrators]]);
    }

    public function revokeSessions(ConfirmAdministratorActionRequest $request, User $administrator): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user();
        $this->accounts->revokeSessions($actor, $administrator, $request->string('currentPassword')->toString(), $request->string('reason')->toString());

        return response()->json(['data' => ['revoked' => true]]);
    }
}
