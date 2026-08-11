<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

final class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->limit(50)
            ->get()
            ->map(static fn (DatabaseNotification $notification): array => [
                'id' => $notification->getKey(),
                'eventType' => $notification->data['eventType'] ?? 'system_event',
                'title' => $notification->data['title'] ?? 'Pathways update',
                'message' => $notification->data['message'] ?? '',
                'context' => $notification->data['context'] ?? [],
                'readAt' => $notification->read_at?->toAtomString(),
                'createdAt' => $notification->created_at?->toAtomString(),
            ]);

        return response()->json(['data' => $notifications]);
    }

    public function markRead(Request $request, DatabaseNotification $notification): JsonResponse
    {
        abort_unless(
            $notification->notifiable_type === $request->user()::class
            && (int) $notification->notifiable_id === $request->user()->getKey(),
            404,
        );
        $notification->markAsRead();

        return response()->json(['data' => ['id' => $notification->getKey(), 'readAt' => $notification->read_at?->toAtomString()]]);
    }
}
