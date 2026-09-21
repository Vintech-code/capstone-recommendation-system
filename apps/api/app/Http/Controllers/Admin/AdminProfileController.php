<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RoleSlug;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

final class AdminProfileController extends Controller
{
    public function storePhoto(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120', 'dimensions:min_width=160,min_height=160,max_width=5000,max_height=5000'],
        ]);

        $user = $request->user();
        $previousPath = $user->admin_photo_path;

        $path = $validated['photo']->store('admin-profile-media/' . $user->getKey(), 'local');
        abort_unless($path, 500, 'The profile photo could not be stored.');

        $user->update(['admin_photo_path' => $path]);

        if ($previousPath && $previousPath !== $path) {
            Storage::disk('local')->delete($previousPath);
        }

        return response()->json([
            'data' => [
                'photoUrl' => '/api/v1/admin/profile/photo?v=' . $user->fresh()->updated_at?->getTimestamp(),
            ],
        ], 201);
    }

    public function destroyPhoto(Request $request): JsonResponse
    {
        $user = $request->user();
        $previousPath = $user->admin_photo_path;

        $user->update(['admin_photo_path' => null]);

        if ($previousPath) {
            Storage::disk('local')->delete($previousPath);
        }

        return response()->json([
            'data' => [
                'photoUrl' => $user->google_avatar_url,
            ],
        ]);
    }

    public function showPhoto(Request $request): mixed
    {
        $user = $request->user();
        $path = $user->admin_photo_path;

        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }

    public function showAdministratorPhoto(Request $request, User $administrator): mixed
    {
        $viewer = $request->user();
        abort_unless(
            $viewer->is($administrator) || $viewer->hasRole(RoleSlug::Admin),
            403,
        );
        $path = $administrator->admin_photo_path;

        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }
}
