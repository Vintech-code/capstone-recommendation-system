<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\AssessmentSession;
use App\Models\ConfigurationVersion;
use App\Models\GuidanceAppointment;
use App\Models\GuidanceCase;
use App\Models\GuidanceRequest;
use App\Models\RecommendationRun;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use App\Services\Recommendation\ProgrammeSourceRegistry;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use App\Services\Student\StudentProfilePresenter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class AdminWorkspaceController extends Controller
{
    public function overview(Request $request, TccProgrammeCatalogueRepository $catalogues, ProgrammeSourceRegistry $sourceRegistry): JsonResponse
    {
        $students = $this->studentQuery()->count();
        $currentSessions = AssessmentSession::query()
            ->whereIn('id', AssessmentSession::query()->selectRaw('MAX(id)')->groupBy('user_id'));
        $statusCounts = (clone $currentSessions)
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $recent = (clone $currentSessions)
            ->with('user:id,name,email')
            ->whereIn('status', ['result_available', 'result_failed'])
            ->latest('updated_at')
            ->limit(6)
            ->get()
            ->map(fn (AssessmentSession $session): array => $this->sessionSummary($session));
        $operationalAttention = null;
        if ($request->user()->hasRole(RoleSlug::Admin)) {
            $operationalAttention = [
                'processingFailures' => (int) ($statusCounts['result_failed'] ?? 0),
                'unverifiedSources' => collect($sourceRegistry->entries($catalogues->current()))
                    ->whereIn('reviewStatus', ['not_verified', 'review_due'])
                    ->count(),
                'unpublishedDrafts' => ConfigurationVersion::query()->where('status', 'draft')->count(),
                'suspendedCounselors' => User::query()
                    ->where('account_status', 'suspended')
                    ->whereHas('roles', static fn (Builder $query) => $query->where('slug', RoleSlug::Counselor->value))
                    ->count(),
                'scheduledAppointments' => GuidanceAppointment::query()
                    ->where('status', 'scheduled')
                    ->where('scheduled_at', '>=', now())
                    ->count(),
                'pendingGuidanceRequests' => GuidanceRequest::query()->where('status', 'pending')->count(),
            ];
        }

        return response()->json(['data' => [
            'students' => $students,
            'assessments' => (clone $currentSessions)->count(),
            'completed' => (int) ($statusCounts['result_available'] ?? 0),
            'inProgress' => (int) ($statusCounts['in_progress'] ?? 0),
            'needsAttention' => (int) ($statusCounts['result_failed'] ?? 0),
            'recommendations' => RecommendationRun::query()->distinct()->count('user_id'),
            'pendingGuidanceRequests' => GuidanceRequest::query()->where('status', 'pending')->count(),
            ...($operationalAttention === null ? [] : ['operationalAttention' => $operationalAttention]),
            'recentActivity' => $recent,
        ]]);
    }

    public function students(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
        ]);
        $search = trim((string) ($validated['search'] ?? ''));

        $students = $this->studentQuery()
            ->when($search !== '', static function (Builder $query) use ($search): void {
                $query->where(static function (Builder $query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->withCount('assessmentSessions')
            ->with(['assessmentSessions' => static fn ($query) => $query
                ->where('status', 'result_available')
                ->latest('attempt_number')
                ->limit(1)])
            ->orderBy('name')
            ->limit(100)
            ->get()
            ->map(function (User $student): array {
                $latest = $student->assessmentSessions->first();

                return [
                    'id' => $student->getKey(),
                    'name' => $student->name,
                    'email' => $student->email,
                    'accountStatus' => $student->account_status,
                    'attemptCount' => $student->assessment_sessions_count,
                    'latestResultAt' => $latest?->result_available_at?->toAtomString(),
                    'latestTopCode' => $latest ? $this->topCode($latest) : null,
                ];
            });

        return response()->json(['data' => $students]);
    }

    public function student(Request $request, User $student, StudentProfilePresenter $profiles): JsonResponse
    {
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);

        if ($request->user()->hasRole(RoleSlug::Counselor)) {
            AdminAuditEvent::query()->create([
                'actor_id' => $request->user()->getKey(),
                'action' => 'counselor.student_record.viewed',
                'subject_type' => 'student',
                'subject_reference' => (string) $student->getKey(),
                'metadata' => ['portal' => 'counselor'],
            ]);
        }

        $attempts = $student->assessmentSessions()
            ->with('recommendationRun')
            ->latest('attempt_number')
            ->get()
            ->map(fn (AssessmentSession $session): array => array_merge(
                $this->sessionSummary($session),
                [
                    'dimensions' => $this->dimensions($session),
                    'recommendations' => $session->recommendationRun?->ranked_courses ?? [],
                ],
            ));
        $guidanceCase = GuidanceCase::query()
            ->where('student_id', $student->getKey())
            ->with([
                'assignedTo:id,name',
                'notes' => static fn ($query) => $query->with('author:id,name')->latest(),
                'summaries' => static fn ($query) => $query->with(['author:id,name', 'publishedBy:id,name'])->latest(),
            ])
            ->first();

        return response()->json(['data' => [
            'id' => $student->getKey(),
            'name' => $student->name,
            'email' => $student->email,
            'accountStatus' => $student->account_status,
            'profile' => $profiles->present($student),
            'attempts' => $attempts,
            'guidanceCase' => $guidanceCase ? [
                'id' => $guidanceCase->getKey(),
                'status' => $guidanceCase->status,
                'followUpOn' => $guidanceCase->follow_up_on?->toDateString(),
                'assignedTo' => $guidanceCase->assignedTo?->name,
                'assignedToId' => $guidanceCase->assigned_to_id,
                'notes' => $guidanceCase->notes->map(static fn ($note): array => [
                    'id' => $note->getKey(),
                    'body' => $note->body,
                    'author' => $note->author?->name,
                    'createdAt' => $note->created_at?->toAtomString(),
                ]),
                'summaries' => $guidanceCase->summaries->map(static fn ($summary): array => [
                    'id' => $summary->getKey(),
                    'body' => $summary->body,
                    'author' => $summary->author?->name,
                    'status' => $summary->published_at === null ? 'draft' : 'published',
                    'publishedBy' => $summary->publishedBy?->name,
                    'publishedAt' => $summary->published_at?->toAtomString(),
                    'createdAt' => $summary->created_at?->toAtomString(),
                    'updatedAt' => $summary->updated_at?->toAtomString(),
                ]),
            ] : null,
        ]]);
    }

    public function assessments(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:in_progress,preparing_result,result_available,result_failed'],
        ]);

        $sessions = AssessmentSession::query()
            ->whereIn('id', AssessmentSession::query()->selectRaw('MAX(id)')->groupBy('user_id'))
            ->with(['user' => static fn ($query) => $query->select('id', 'name', 'email')->withCount('assessmentSessions')])
            ->when(isset($validated['status']), fn (Builder $query) => $query->where('status', $validated['status']))
            ->latest('updated_at')
            ->limit(100)
            ->get()
            ->map(fn (AssessmentSession $session): array => $this->sessionSummary($session));

        return response()->json(['data' => $sessions]);
    }

    public function counselors(Request $request): JsonResponse
    {
        $staff = User::query()
            ->whereHas('roles', static fn (Builder $query) => $query->where('slug', RoleSlug::Counselor->value))
            ->when($request->user()->hasRole(RoleSlug::Counselor), fn (Builder $query) => $query->whereKey($request->user()->getKey()))
            ->with(['assignedGuidanceCases' => static fn ($query) => $query
                ->with('student:id,name,email')
                ->orderByRaw("case when status = 'follow_up' then 0 when status = 'open' then 1 else 2 end")
                ->orderBy('follow_up_on')])
            ->orderBy('name')
            ->get()
            ->map(static function (User $member): array {
                $active = $member->assignedGuidanceCases->where('status', '!=', 'closed');

                return [
                    'id' => $member->getKey(),
                    'name' => $member->name,
                    'email' => $member->email,
                    'accountStatus' => $member->account_status,
                    'mustChangePassword' => (bool) $member->must_change_password,
                    'assignedCaseCount' => $member->assignedGuidanceCases->count(),
                    'activeCaseCount' => $active->count(),
                    'followUpCount' => $active->where('status', 'follow_up')->count(),
                    'overdueCount' => $active->filter(static fn (GuidanceCase $case): bool => $case->follow_up_on?->isBefore(today()) ?? false)->count(),
                    'assignments' => $member->assignedGuidanceCases->map(static fn (GuidanceCase $case): array => [
                        'caseId' => $case->getKey(),
                        'studentId' => $case->student_id,
                        'studentName' => $case->student?->name,
                        'studentEmail' => $case->student?->email,
                        'status' => $case->status,
                        'followUpOn' => $case->follow_up_on?->toDateString(),
                    ])->values(),
                ];
            });

        return response()->json(['data' => $staff]);
    }

    public function programmes(TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();
        $savedCounts = StudentSavedProgramme::query()
            ->selectRaw('programme_id, count(*) as aggregate')
            ->groupBy('programme_id')
            ->pluck('aggregate', 'programme_id');
        $guidanceRequestCounts = GuidanceRequest::query()
            ->where('status', 'pending')
            ->whereNotNull('programme_id')
            ->selectRaw('programme_id, count(*) as aggregate')
            ->groupBy('programme_id')
            ->pluck('aggregate', 'programme_id');

        return response()->json(['data' => [
            'academicYear' => $catalogue['academic_year'],
            'catalogueVersion' => $catalogue['catalogue_version'],
            'catalogueStatus' => $catalogue['catalogue_status'],
            'programmes' => array_map(static fn (array $programme): array => [
                'id' => $programme['id'],
                'code' => $programme['short_label'],
                'name' => $programme['display_name'],
                'profile' => $programme['riasec_profile'] ?? [],
                'profileStatus' => $programme['riasec_profile_status'] ?? 'unknown',
                'profileVersion' => $programme['profile_version'] ?? null,
                'majors' => $programme['majors'] ?? [],
                'recommendedStrands' => $programme['recommended_strands'] ?? [],
                'description' => $programme['description'] ?? '',
                'learningAreas' => $programme['learning_areas'] ?? [],
                'learningAreaDescriptions' => $programme['learning_area_descriptions'] ?? [],
                'learningAreaTopics' => $programme['learning_area_topics'] ?? [],
                'careerDirections' => $programme['career_directions'] ?? [],
                'strandGuidance' => $programme['strand_guidance'] ?? '',
                'requirements' => $programme['requirements'] ?? [],
                'readinessPrompt' => $programme['readiness_prompt'] ?? '',
                'contentVersion' => $programme['content_version'] ?? null,
                'degreeType' => $programme['degree_type'] ?? '',
                'duration' => $programme['duration'] ?? null,
                'salary' => $programme['salary'] ?? null,
                'jobGrowth' => $programme['job_growth'] ?? null,
                'outlookVersion' => $programme['outlook_version'] ?? null,
                'coverImageUrl' => $programme['cover_image_url'] ?? null,
                'logoImageUrl' => $programme['logo_image_url'] ?? null,
                'monitoring' => [
                    'savedByStudents' => (int) ($savedCounts[$programme['id']] ?? 0),
                    'pendingGuidanceRequests' => (int) ($guidanceRequestCounts[$programme['id']] ?? 0),
                ],
            ], $catalogue['programmes'] ?? []),
        ]]);
    }

    public function methodology(TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();
        $policy = $catalogue['matching_policy'];

        return response()->json(['data' => [
            'status' => $policy['approval_status'],
            'reviewStatus' => $policy['review_status'],
            'designatedReviewer' => $policy['designated_reviewer'],
            'method' => $policy['method'],
            'formula' => $policy['formula'],
            'normalization' => $policy['normalization'],
            'eligibility' => $policy['eligibility'],
            'tieBreak' => $policy['tie_break'],
            'display' => $policy['display'],
            'catalogueReference' => 'TCC-AY-'.$catalogue['academic_year'].'-V'.$catalogue['catalogue_version'],
        ]]);
    }

    public function reports(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->reportPayload($request)]);
    }

    public function exportReports(Request $request): StreamedResponse
    {
        abort_if((bool) config('pathways.identifiable_exports_enabled'), 500, 'Identifiable exports must remain disabled for the current MVP.');
        $report = $this->reportPayload($request);
        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => 'report.exported',
            'subject_type' => 'aggregate_report',
            'subject_reference' => now()->format('Ymd-His'),
            'metadata' => ['from' => $report['from'], 'to' => $report['to'], 'format' => 'csv', 'dataClassification' => 'aggregate_only'],
        ]);

        return response()->streamDownload(static function () use ($report): void {
            $stream = fopen('php://output', 'w');
            $write = static fn (array $row) => fputcsv($stream, array_map(self::csvCell(...), $row));
            $write(['Pathways aggregate guidance report']);
            $write(['Scope', $report['scope'] === 'counselor' ? 'Signed-in counselor records' : 'Institution records']);
            $write(['From', $report['from'] ?: 'All records']);
            $write(['To', $report['to'] ?: 'All records']);
            $write(['Students in report scope', $report['studentCount']]);
            $write(['Students with assessment activity', $report['assessmentActivity']]);
            $write(['Students who started in period and now have results', $report['completedAssessments']]);
            $write(['Completion rate for students who started in period', $report['assessmentCompletionRate'].'%']);
            $write(['Students with generated recommendations', $report['recommendationRuns']]);
            $write(['Programme saves recorded', $report['programmeSaves']]);
            $write([]);
            $write(['Appointment lifecycle', 'Count']);
            foreach ($report['appointmentStatuses'] as $status => $count) {
                $write([str_replace('_', ' ', ucfirst($status)), $count]);
            }
            $write(['Average minutes from request submission to appointment creation', $report['averageRequestToAppointmentMinutes'] ?? 'Not available']);
            $write(['Open guidance cases with a follow-up date', $report['openFollowUps']]);
            $write(['Overdue open follow-ups', $report['overdueFollowUps']]);
            $write(['Closed guidance cases', $report['closedGuidanceCases']]);
            $write([]);
            $write(['Guidance request lifecycle', 'Count']);
            foreach ($report['guidanceRequestStatuses'] as $status => $count) {
                $write([str_replace('_', ' ', ucfirst($status)), $count]);
            }
            $write([]);
            $write(['Assessment completion month', 'Completed students']);
            foreach ($report['assessmentCompletionsByMonth'] as $month) {
                $write([$month['month'], $month['count']]);
            }
            fclose($stream);
        }, 'pathways-guidance-report-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv']);
    }

    public function activity(): JsonResponse
    {
        $events = AdminAuditEvent::query()
            ->with('actor:id,name')
            ->latest()
            ->limit(100)
            ->get()
            ->map(static fn (AdminAuditEvent $event): array => [
                'id' => $event->getKey(),
                'actor' => $event->actor?->name,
                'action' => $event->action,
                'subjectType' => $event->subject_type,
                'subjectReference' => $event->subject_reference,
                'metadata' => $event->metadata,
                'createdAt' => $event->created_at?->toAtomString(),
            ]);

        return response()->json(['data' => $events]);
    }

    /** @return array<string, mixed> */
    private function reportPayload(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);
        $from = $validated['from'] ?? null;
        $to = $validated['to'] ?? null;
        $isCounselor = $request->user()->hasRole(RoleSlug::Counselor);
        $studentIds = $isCounselor
            ? collect()
                ->merge(GuidanceCase::query()->where('assigned_to_id', $request->user()->getKey())->pluck('student_id'))
                ->merge(GuidanceRequest::query()->where('accepted_by', $request->user()->getKey())->pluck('student_id'))
                ->merge(GuidanceAppointment::query()->where('counselor_id', $request->user()->getKey())->pluck('student_id'))
                ->map(static fn ($id): int => (int) $id)
                ->unique()
                ->values()
            : null;
        $studentScope = fn (Builder $query): Builder => $isCounselor
            ? $query->whereIn('user_id', $studentIds)
            : $query;
        $period = static function (Builder $query, string $column) use ($from, $to): Builder {
            return $query
                ->when($from, fn (Builder $builder) => $builder->whereDate($column, '>=', $from))
                ->when($to, fn (Builder $builder) => $builder->whereDate($column, '<=', $to));
        };

        $assessmentActivityQuery = $studentScope(AssessmentSession::query());
        $period($assessmentActivityQuery, 'started_at');
        $completedStudents = (clone $assessmentActivityQuery)
            ->where('status', 'result_available')
            ->distinct()
            ->count('user_id');
        $assessmentActivity = (clone $assessmentActivityQuery)->distinct()->count('user_id');

        $completionEventQuery = $studentScope(AssessmentSession::query()->where('status', 'result_available'));
        $period($completionEventQuery, 'result_available_at');

        $runs = $studentScope(RecommendationRun::query())
            ->when($from, fn (Builder $query) => $query->whereDate('generated_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->whereDate('generated_at', '<=', $to))
            ->get(['user_id']);

        $requestQuery = GuidanceRequest::query()
            ->when($isCounselor, fn (Builder $query) => $query->where('accepted_by', $request->user()->getKey()));
        $period($requestQuery, 'created_at');
        $requestStatuses = (clone $requestQuery)->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status');

        $appointmentQuery = GuidanceAppointment::query()
            ->when($isCounselor, fn (Builder $query) => $query->where('counselor_id', $request->user()->getKey()));
        $period($appointmentQuery, 'scheduled_at');
        $appointmentStatuses = (clone $appointmentQuery)->selectRaw('status, count(*) as aggregate')->groupBy('status')->pluck('aggregate', 'status');

        $linkedRequests = (clone $requestQuery)->with('appointment:id,created_at')->whereNotNull('appointment_id')->get(['id', 'appointment_id', 'created_at']);
        $waitMinutes = $linkedRequests->map(static function (GuidanceRequest $guidanceRequest): ?int {
            if ($guidanceRequest->appointment?->created_at === null || $guidanceRequest->created_at === null) {
                return null;
            }

            return max(0, (int) $guidanceRequest->created_at->diffInMinutes($guidanceRequest->appointment->created_at, false));
        })->filter(static fn (?int $minutes): bool => $minutes !== null);

        $caseQuery = GuidanceCase::query()
            ->when($isCounselor, fn (Builder $query) => $query->where('assigned_to_id', $request->user()->getKey()));
        $followUpQuery = (clone $caseQuery)->where('status', '!=', 'closed')->whereNotNull('follow_up_on');
        if ($from) {
            $followUpQuery->whereDate('follow_up_on', '>=', $from);
        }
        if ($to) {
            $followUpQuery->whereDate('follow_up_on', '<=', $to);
        }

        $savedProgrammeQuery = $studentScope(StudentSavedProgramme::query());
        $period($savedProgrammeQuery, 'created_at');

        $completionMonths = (clone $completionEventQuery)
            ->get(['user_id', 'result_available_at'])
            ->groupBy(static fn (AssessmentSession $session): string => $session->result_available_at->format('Y-m'))
            ->sortKeys()
            ->map(static fn ($sessions, string $month): array => [
                'month' => $month,
                'count' => $sessions->pluck('user_id')->unique()->count(),
            ])
            ->values()
            ->all();

        return [
            'generatedAt' => now()->toAtomString(),
            'from' => $from,
            'to' => $to,
            'scope' => $isCounselor ? 'counselor' : 'institution',
            'studentCount' => $isCounselor ? $studentIds->count() : $this->studentQuery()->count(),
            'assessmentActivity' => $assessmentActivity,
            'completedAssessments' => $completedStudents,
            'assessmentCompletionRate' => $assessmentActivity > 0 ? round(($completedStudents / $assessmentActivity) * 100, 1) : 0,
            'recommendationRuns' => $runs->pluck('user_id')->filter()->unique()->count(),
            'programmeSaves' => $savedProgrammeQuery->count(),
            'guidanceRequestStatuses' => collect(['pending', 'accepted', 'scheduled', 'closed', 'declined', 'cancelled'])
                ->mapWithKeys(static fn (string $status): array => [$status => (int) ($requestStatuses[$status] ?? 0)])
                ->all(),
            'appointmentStatuses' => collect(['scheduled', 'completed', 'cancelled', 'no_show'])
                ->mapWithKeys(static fn (string $status): array => [$status => (int) ($appointmentStatuses[$status] ?? 0)])
                ->all(),
            'averageRequestToAppointmentMinutes' => $waitMinutes->isEmpty() ? null : round($waitMinutes->average(), 1),
            'openFollowUps' => (clone $followUpQuery)->count(),
            'overdueFollowUps' => (clone $followUpQuery)->whereDate('follow_up_on', '<', today())->count(),
            'closedGuidanceCases' => (clone $caseQuery)->where('status', 'closed')->count(),
            'assessmentCompletionsByMonth' => $completionMonths,
        ];
    }

    private static function csvCell(mixed $value): string|int|float
    {
        if (! is_string($value)) {
            return $value;
        }

        return preg_match('/^[=+\-@\t\r]/', $value) === 1 ? "'".$value : $value;
    }

    /** @return Builder<User> */
    private function studentQuery(): Builder
    {
        return User::query()->whereHas('roles', static fn (Builder $query) => $query->where('slug', RoleSlug::Student->value));
    }

    /** @return array<string, mixed> */
    private function sessionSummary(AssessmentSession $session): array
    {
        return [
            'id' => $session->getKey(),
            'reference' => 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT),
            'studentId' => $session->user_id,
            'studentName' => $session->user?->name,
            'studentEmail' => $session->user?->email,
            'attemptNumber' => $session->attempt_number,
            'attemptCount' => (int) ($session->user?->assessment_sessions_count ?? $session->attempt_number),
            'retakeReason' => $session->retake_reason,
            'status' => $session->status,
            'topCode' => $this->topCode($session),
            'startedAt' => $session->started_at?->toAtomString(),
            'submittedAt' => $session->submitted_at?->toAtomString(),
            'resultAvailableAt' => $session->result_available_at?->toAtomString(),
            'processingErrorCode' => $session->processing_error_code,
        ];
    }

    /** @return array<int, array{code: string, label: string, value: int}> */
    private function dimensions(AssessmentSession $session): array
    {
        $labels = [
            'r' => 'Realistic', 'realistic' => 'Realistic',
            'i' => 'Investigative', 'investigative' => 'Investigative',
            'a' => 'Artistic', 'artistic' => 'Artistic',
            's' => 'Social', 'social' => 'Social',
            'e' => 'Enterprising', 'enterprising' => 'Enterprising',
            'c' => 'Conventional', 'conventional' => 'Conventional',
        ];
        $codes = ['Realistic' => 'R', 'Investigative' => 'I', 'Artistic' => 'A', 'Social' => 'S', 'Enterprising' => 'E', 'Conventional' => 'C'];
        $entries = $session->result_payload['result'] ?? [];
        if (! is_array($entries)) {
            return [];
        }

        $dimensions = [];
        foreach ($entries as $key => $entry) {
            if (! is_array($entry)) {
                $entry = ['area' => is_string($key) ? $key : '', 'score' => $entry];
            }
            $areaKey = strtolower(trim((string) ($entry['area'] ?? $entry['title'] ?? $entry['code'] ?? '')));
            $label = $labels[$areaKey] ?? null;
            if ($label === null || isset($dimensions[$codes[$label]])) {
                continue;
            }
            $dimensions[$codes[$label]] = [
                'code' => $codes[$label],
                'label' => $label,
                'value' => (int) ($entry['score'] ?? $entry['value'] ?? 0),
            ];
        }

        return array_values($dimensions);
    }

    private function topCode(AssessmentSession $session): ?string
    {
        $dimensions = $this->dimensions($session);
        if ($dimensions === []) {
            return null;
        }

        foreach ($dimensions as $index => &$entry) {
            $entry['_order'] = $index;
        }
        unset($entry);
        usort($dimensions, static fn (array $left, array $right): int => ($right['value'] <=> $left['value'])
            ?: ($left['_order'] <=> $right['_order'])
        );

        return implode('-', array_column(array_slice($dimensions, 0, 2), 'code'));
    }
}
