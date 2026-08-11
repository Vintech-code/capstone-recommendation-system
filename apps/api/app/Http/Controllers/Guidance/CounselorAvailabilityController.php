<?php

namespace App\Http\Controllers\Guidance;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\CounselorAvailabilityWindow;
use App\Models\GuidanceAppointment;
use App\Services\Notifications\NotificationPolicyScheduler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CounselorAvailabilityController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->payload($request->user()->getKey())]);
    }

    public function update(Request $request, NotificationPolicyScheduler $notificationPolicies): JsonResponse
    {
        $validated = $request->validate([
            'timezone' => ['required', 'in:Asia/Manila'],
            'windows' => ['required', 'array', 'max:21'],
            'windows.*.weekday' => ['required', 'integer', 'between:0,6'],
            'windows.*.startsAt' => ['required', 'date_format:H:i'],
            'windows.*.endsAt' => ['required', 'date_format:H:i'],
        ]);
        $windows = collect($validated['windows'])
            ->map(static fn (array $window): array => [
                'weekday' => (int) $window['weekday'],
                'startsAt' => $window['startsAt'],
                'endsAt' => $window['endsAt'],
            ])
            ->sortBy([['weekday', 'asc'], ['startsAt', 'asc']])
            ->values();

        foreach ($windows->groupBy('weekday') as $dayWindows) {
            $previousEnd = null;
            foreach ($dayWindows as $window) {
                if ($window['startsAt'] >= $window['endsAt']) {
                    throw ValidationException::withMessages(['windows' => 'Each availability end time must be later than its start time.']);
                }
                if ($previousEnd !== null && $window['startsAt'] < $previousEnd) {
                    throw ValidationException::withMessages(['windows' => 'Availability windows on the same day cannot overlap.']);
                }
                $previousEnd = $window['endsAt'];
            }
        }

        DB::transaction(function () use ($request, $windows): void {
            CounselorAvailabilityWindow::query()
                ->where('counselor_id', $request->user()->getKey())
                ->delete();

            foreach ($windows as $window) {
                CounselorAvailabilityWindow::query()->create([
                    'counselor_id' => $request->user()->getKey(),
                    'weekday' => $window['weekday'],
                    'starts_at' => $window['startsAt'],
                    'ends_at' => $window['endsAt'],
                    'timezone' => 'Asia/Manila',
                ]);
            }

            AdminAuditEvent::query()->create([
                'actor_id' => $request->user()->getKey(),
                'action' => 'counselor_availability.updated',
                'subject_type' => 'counselor_availability',
                'subject_reference' => (string) $request->user()->getKey(),
                'metadata' => ['timezone' => 'Asia/Manila', 'window_count' => $windows->count()],
            ]);
        });

        GuidanceAppointment::query()
            ->where('counselor_id', $request->user()->getKey())
            ->where('status', 'scheduled')
            ->whereNotNull('student_confirmed_at')
            ->where('scheduled_at', '>', now())
            ->get()
            ->each(fn (GuidanceAppointment $appointment) => $notificationPolicies->refreshAppointmentReminders($appointment));

        return response()->json(['data' => $this->payload($request->user()->getKey())]);
    }

    /** @return array<string, mixed> */
    private function payload(int $counselorId): array
    {
        $windows = CounselorAvailabilityWindow::query()
            ->where('counselor_id', $counselorId)
            ->orderBy('weekday')
            ->orderBy('starts_at')
            ->get();

        return [
            'configured' => $windows->isNotEmpty(),
            'timezone' => 'Asia/Manila',
            'windows' => $windows->map(static fn (CounselorAvailabilityWindow $window): array => [
                'id' => $window->getKey(),
                'weekday' => $window->weekday,
                'startsAt' => substr($window->starts_at, 0, 5),
                'endsAt' => substr($window->ends_at, 0, 5),
            ])->values()->all(),
        ];
    }
}
