<?php

namespace App\Services\Guidance;

use App\Models\CounselorAvailabilityWindow;
use App\Models\GuidanceAppointment;
use Carbon\CarbonImmutable;

final class CounselorAvailabilitySlotService
{
    /**
     * @return array<int, array{startsAt: string, endsAt: string}>
     */
    public function slotsFor(
        int $counselorId,
        CarbonImmutable $date,
        int $durationMinutes,
        ?int $exceptAppointmentId = null,
    ): array {
        $manilaDate = $date->setTimezone('Asia/Manila')->startOfDay();
        $now = CarbonImmutable::now('Asia/Manila');
        $windows = CounselorAvailabilityWindow::query()
            ->where('counselor_id', $counselorId)
            ->where('weekday', $manilaDate->dayOfWeek)
            ->orderBy('starts_at')
            ->get();

        if ($windows->isEmpty()) {
            return [];
        }

        $dayStartUtc = $manilaDate->utc();
        $dayEndUtc = $manilaDate->endOfDay()->utc();
        $appointments = GuidanceAppointment::query()
            ->where('counselor_id', $counselorId)
            ->where('status', 'scheduled')
            ->where('scheduled_at', '<=', $dayEndUtc)
            ->where(function ($query) use ($dayStartUtc): void {
                $query->where('ends_at', '>', $dayStartUtc)
                    ->orWhere(function ($legacy) use ($dayStartUtc): void {
                        $legacy->whereNull('ends_at')->where('scheduled_at', '>=', $dayStartUtc);
                    });
            })
            ->when($exceptAppointmentId !== null, fn ($query) => $query->whereKeyNot($exceptAppointmentId))
            ->orderBy('scheduled_at')
            ->get(['id', 'scheduled_at', 'ends_at']);

        $slots = [];
        foreach ($windows as $window) {
            $windowStart = CarbonImmutable::parse($manilaDate->format('Y-m-d').' '.$window->starts_at, 'Asia/Manila');
            $windowEnd = CarbonImmutable::parse($manilaDate->format('Y-m-d').' '.$window->ends_at, 'Asia/Manila');
            $freeSegments = [[$windowStart, $windowEnd]];

            foreach ($appointments as $appointment) {
                $busyStart = CarbonImmutable::instance($appointment->scheduled_at)->setTimezone('Asia/Manila');
                // A legacy record without an end cannot safely expose time after its start as available.
                $busyEnd = $appointment->ends_at !== null
                    ? CarbonImmutable::instance($appointment->ends_at)->setTimezone('Asia/Manila')
                    : $windowEnd;
                $freeSegments = $this->subtractBusyWindow($freeSegments, $busyStart, $busyEnd);
            }

            foreach ($freeSegments as [$freeStart, $freeEnd]) {
                $cursor = $freeStart;
                while ($cursor->addMinutes($durationMinutes)->lessThanOrEqualTo($freeEnd)) {
                    $slotEnd = $cursor->addMinutes($durationMinutes);
                    if ($cursor->greaterThan($now)) {
                        $slots[] = [
                            'startsAt' => $cursor->toAtomString(),
                            'endsAt' => $slotEnd->toAtomString(),
                        ];
                    }
                    $cursor = $slotEnd;
                }
            }
        }

        return $slots;
    }

    /**
     * @param  array<int, array{0: CarbonImmutable, 1: CarbonImmutable}>  $segments
     * @return array<int, array{0: CarbonImmutable, 1: CarbonImmutable}>
     */
    private function subtractBusyWindow(array $segments, CarbonImmutable $busyStart, CarbonImmutable $busyEnd): array
    {
        $remaining = [];
        foreach ($segments as [$segmentStart, $segmentEnd]) {
            if ($busyEnd->lessThanOrEqualTo($segmentStart) || $busyStart->greaterThanOrEqualTo($segmentEnd)) {
                $remaining[] = [$segmentStart, $segmentEnd];

                continue;
            }
            if ($busyStart->greaterThan($segmentStart)) {
                $remaining[] = [$segmentStart, $busyStart->min($segmentEnd)];
            }
            if ($busyEnd->lessThan($segmentEnd)) {
                $remaining[] = [$busyEnd->max($segmentStart), $segmentEnd];
            }
        }

        return $remaining;
    }
}
