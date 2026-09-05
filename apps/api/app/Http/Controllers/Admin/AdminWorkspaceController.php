<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\AssessmentSession;
use App\Models\ConfigurationVersion;
use App\Models\EntranceExaminationResult;
use App\Models\RecommendationRun;
use App\Models\RoleSlug;
use App\Models\StudentSavedProgramme;
use App\Models\User;
use App\Services\Recommendation\ProgrammeSourceRegistry;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class AdminWorkspaceController extends Controller
{
    public function overview(Request $request, TccProgrammeCatalogueRepository $catalogues, ProgrammeSourceRegistry $sourceRegistry): JsonResponse
    {
        $students = $this->studentQuery()->count();
        $currentSessions = $this->latestSessionQuery();
        $statusCounts = (clone $currentSessions)
            ->selectRaw('status, count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');
        $declared = EntranceExaminationResult::query()
            ->whereNull('superseded_at')
            ->distinct()
            ->count('user_id');
        $started = (clone $currentSessions)->count();

        $recent = (clone $currentSessions)
            ->with(['user:id,name,email', 'entranceExaminationResult', 'recommendationRun'])
            ->whereIn('status', ['result_available', 'result_failed'])
            ->latest('updated_at')
            ->limit(6)
            ->get()
            ->map(fn (AssessmentSession $session): array => $this->sessionSummary($session));
        $operationalAttention = [
            'processingFailures' => (int) ($statusCounts['result_failed'] ?? 0),
            'unverifiedSources' => collect($sourceRegistry->entries($catalogues->current()))
                ->whereIn('reviewStatus', ['not_verified', 'review_due'])
                ->count(),
            'unpublishedDrafts' => ConfigurationVersion::query()->where('status', 'draft')->count(),
        ];

        return response()->json(['data' => [
            'students' => $students,
            'assessments' => $started,
            'completed' => (int) ($statusCounts['result_available'] ?? 0),
            'inProgress' => (int) ($statusCounts['in_progress'] ?? 0),
            'needsAttention' => (int) ($statusCounts['result_failed'] ?? 0),
            'recommendations' => RecommendationRun::query()->distinct()->count('user_id'),
            'funnel' => [
                'registered' => $students,
                'entranceDeclared' => $declared,
                'assessmentStarted' => $started,
                'inProgress' => (int) ($statusCounts['in_progress'] ?? 0),
                'processing' => (int) ($statusCounts['preparing_result'] ?? 0),
                'resultAvailable' => (int) ($statusCounts['result_available'] ?? 0),
            ],
            'operationalAttention' => $operationalAttention,
            'recentActivity' => $recent,
        ]]);
    }

    public function students(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'in:not_started,in_progress,preparing_result,result_available,result_failed'],
            'eligibility' => ['nullable', 'in:not_declared,board,non_board'],
            'sort' => ['nullable', 'in:name,attempt_count,last_activity'],
            'direction' => ['nullable', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'perPage' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);
        $search = trim((string) ($validated['search'] ?? ''));
        $status = $validated['status'] ?? null;
        $eligibility = $validated['eligibility'] ?? null;
        $sort = $validated['sort'] ?? 'name';
        $direction = $validated['direction'] ?? 'asc';
        $perPage = (int) ($validated['perPage'] ?? 25);

        $query = $this->studentQuery()
            ->when($search !== '', static function (Builder $query) use ($search): void {
                $assessmentId = preg_match('/^ASMT-0*(\d+)$/i', $search, $matches) === 1
                    ? (int) $matches[1]
                    : null;
                $query->where(static function (Builder $query) use ($search, $assessmentId): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('latestAssessmentSession', fn (Builder $session) => $session
                            ->where('result_payload', 'like', "%{$search}%"));
                    if ($assessmentId !== null) {
                        $query->orWhereHas('latestAssessmentSession', fn (Builder $session) => $session->whereKey($assessmentId));
                    }
                });
            })
            ->withCount('assessmentSessions')
            ->withCount('savedProgrammes')
            ->with([
                'latestAssessmentSession.recommendationRun',
                'currentEntranceExaminationResult',
            ])
            ->when($status === 'not_started', fn (Builder $query) => $query->whereDoesntHave('assessmentSessions'))
            ->when($status !== null && $status !== 'not_started', fn (Builder $query) => $query->whereHas(
                'latestAssessmentSession',
                fn (Builder $session) => $session->where('status', $status),
            ))
            ->when($eligibility === 'not_declared', fn (Builder $query) => $query->whereDoesntHave('currentEntranceExaminationResult'))
            ->when(in_array($eligibility, ['board', 'non_board'], true), fn (Builder $query) => $query->whereHas(
                'currentEntranceExaminationResult',
                fn (Builder $result) => $result->where('eligibility_group', $eligibility),
            ));

        match ($sort) {
            'attempt_count' => $query->orderBy('assessment_sessions_count', $direction)->orderBy('name'),
            'last_activity' => $query->orderBy(
                AssessmentSession::query()
                    ->select('updated_at')
                    ->whereColumn('user_id', 'users.id')
                    ->latest('attempt_number')
                    ->limit(1),
                $direction,
            )->orderBy('name'),
            default => $query->orderBy('name', $direction),
        };

        $students = $query->paginate($perPage)->withQueryString();
        $items = $students->getCollection()
            ->map(function (User $student): array {
                $latest = $student->latestAssessmentSession;
                $declaration = $student->currentEntranceExaminationResult;

                return [
                    'id' => $student->getKey(),
                    'name' => $student->name,
                    'email' => $student->email,
                    'accountStatus' => $student->account_status,
                    'attemptCount' => $student->assessment_sessions_count,
                    'latestResultAt' => $latest?->result_available_at?->toAtomString(),
                    'latestTopCode' => $latest ? $this->topCode($latest) : null,
                    'declarationStatus' => $declaration ? 'declared' : 'required',
                    'selfDeclaredScore' => $declaration ? (float) $declaration->score : null,
                    'eligibilityGroup' => $declaration?->eligibility_group,
                    'currentAssessmentStatus' => $latest?->status ?? 'not_started',
                    'currentAssessmentReference' => $latest ? $this->reference($latest) : null,
                    'recommendationAvailable' => $latest?->recommendationRun !== null,
                    'savedProgrammeCount' => (int) $student->saved_programmes_count,
                    'lastActivityAt' => $latest?->updated_at?->toAtomString() ?? $declaration?->declared_at?->toAtomString(),
                ];
            });

        return response()->json(['data' => [
            'items' => $items,
            'pagination' => $this->pagination($students),
        ]]);
    }

    public function student(User $student): JsonResponse
    {
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);

        $attempts = $student->assessmentSessions()
            ->with(['recommendationRun', 'entranceExaminationResult'])
            ->latest('attempt_number')
            ->get()
            ->map(fn (AssessmentSession $session): array => array_merge(
                $this->sessionSummary($session),
                [
                    'dimensions' => $this->dimensions($session),
                    'recommendations' => $session->recommendationRun?->ranked_courses ?? [],
                ],
            ));

        return response()->json(['data' => [
            'id' => $student->getKey(),
            'name' => $student->name,
            'email' => $student->email,
            'accountStatus' => $student->account_status,
            'savedProgrammeCount' => $student->savedProgrammes()->count(),
            'attempts' => $attempts,
        ]]);
    }

    public function assessments(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'in:in_progress,preparing_result,result_available,result_failed'],
        ]);

        $sessions = AssessmentSession::query()
            ->whereIn('id', AssessmentSession::query()->selectRaw('MAX(id)')->groupBy('user_id'))
            ->with([
                'user' => static fn ($query) => $query->select('id', 'name', 'email')->withCount('assessmentSessions'),
                'entranceExaminationResult',
                'recommendationRun',
            ])
            ->when(isset($validated['status']), fn (Builder $query) => $query->where('status', $validated['status']))
            ->latest('updated_at')
            ->limit(100)
            ->get()
            ->map(fn (AssessmentSession $session): array => $this->sessionSummary($session));

        return response()->json(['data' => $sessions]);
    }

    public function programmes(TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();
        $savedCounts = StudentSavedProgramme::query()
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
                'eligibilityGroup' => $programme['eligibility_group'] ?? null,
                'majors' => $programme['majors'] ?? [],
                'recommendedStrands' => $programme['recommended_strands'] ?? [],
                'description' => $programme['description'] ?? '',
                'learningAreas' => $programme['learning_areas'] ?? [],
                'learningAreaDescriptions' => $programme['learning_area_descriptions'] ?? [],
                'learningAreaTopics' => $programme['learning_area_topics'] ?? [],
                'careerDirections' => $programme['career_directions'] ?? [],
                'careerOpportunities' => $programme['career_opportunities'] ?? [],
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

    public function reports(
        Request $request,
        TccProgrammeCatalogueRepository $catalogues,
        ProgrammeSourceRegistry $sourceRegistry,
    ): JsonResponse {
        return response()->json(['data' => $this->reportPayload($request, $catalogues, $sourceRegistry)]);
    }

    public function exportReports(
        Request $request,
        TccProgrammeCatalogueRepository $catalogues,
        ProgrammeSourceRegistry $sourceRegistry,
    ): StreamedResponse {
        abort_if((bool) config('pathways.identifiable_exports_enabled'), 500, 'Identifiable exports must remain disabled for the current MVP.');
        $report = $this->reportPayload($request, $catalogues, $sourceRegistry);
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
            $write(['Pathways aggregate system report']);
            $write(['Scope', 'Institution records']);
            $write(['From', $report['from'] ?: 'All records']);
            $write(['To', $report['to'] ?: 'All records']);
            $write(['Students in report scope', $report['studentCount']]);
            $write(['Students with current entrance declarations', $report['entranceDeclarations']]);
            $write(['Board-programme eligible declarations', $report['eligibilityDistribution']['board']]);
            $write(['Non-board-programme eligible declarations', $report['eligibilityDistribution']['nonBoard']]);
            $write(['Students with assessment activity', $report['assessmentActivity']]);
            $write(['Students who started in period and now have results', $report['completedAssessments']]);
            $write(['Completion rate for students who started in period', $report['assessmentCompletionRate'].'%']);
            $write(['Students with generated recommendations', $report['recommendationRuns']]);
            $write(['Programme saves recorded', $report['programmeSaves']]);
            $write(['Assessment completion month', 'Completed students']);
            foreach ($report['assessmentCompletionsByMonth'] as $month) {
                $write([$month['month'], $month['count']]);
            }
            fclose($stream);
        }, 'pathways-system-report-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv']);
    }

    public function activity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'actor' => ['nullable', 'integer', 'exists:users,id'],
            'action' => ['nullable', 'string', 'max:80'],
            'subjectType' => ['nullable', 'string', 'max:64'],
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'page' => ['nullable', 'integer', 'min:1'],
            'perPage' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);
        $events = AdminAuditEvent::query()
            ->with('actor:id,name')
            ->when(isset($validated['actor']), fn (Builder $query) => $query->where('actor_id', $validated['actor']))
            ->when(isset($validated['action']), fn (Builder $query) => $query->where('action', $validated['action']))
            ->when(isset($validated['subjectType']), fn (Builder $query) => $query->where('subject_type', $validated['subjectType']))
            ->when(isset($validated['from']), fn (Builder $query) => $query->whereDate('created_at', '>=', $validated['from']))
            ->when(isset($validated['to']), fn (Builder $query) => $query->whereDate('created_at', '<=', $validated['to']))
            ->latest()
            ->paginate((int) ($validated['perPage'] ?? 25));
        $items = $events->getCollection()
            ->map(static fn (AdminAuditEvent $event): array => [
                'id' => $event->getKey(),
                'actorId' => $event->actor_id,
                'actor' => $event->actor?->name,
                'action' => $event->action,
                'subjectType' => $event->subject_type,
                'subjectReference' => $event->subject_reference,
                'summary' => self::auditSummary($event),
                'metadata' => self::safeAuditMetadata($event->metadata),
                'createdAt' => $event->created_at?->toAtomString(),
            ]);

        return response()->json(['data' => [
            'items' => $items,
            'pagination' => $this->pagination($events),
            'filters' => [
                'actors' => AdminAuditEvent::query()->with('actor:id,name')->get()->pluck('actor')->filter()->unique('id')->values()->map(fn (User $actor) => ['id' => $actor->getKey(), 'name' => $actor->name]),
                'actions' => AdminAuditEvent::query()->distinct()->orderBy('action')->pluck('action'),
                'subjectTypes' => AdminAuditEvent::query()->distinct()->orderBy('subject_type')->pluck('subject_type'),
            ],
        ]]);
    }

    /** @return array<string, mixed> */
    private function reportPayload(
        Request $request,
        TccProgrammeCatalogueRepository $catalogues,
        ProgrammeSourceRegistry $sourceRegistry,
    ): array {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);
        $from = $validated['from'] ?? null;
        $to = $validated['to'] ?? null;
        $period = static function (Builder $query, string $column) use ($from, $to): Builder {
            return $query
                ->when($from, fn (Builder $builder) => $builder->whereDate($column, '>=', $from))
                ->when($to, fn (Builder $builder) => $builder->whereDate($column, '<=', $to));
        };

        $assessmentActivityQuery = AssessmentSession::query();
        $period($assessmentActivityQuery, 'started_at');
        $completedStudents = (clone $assessmentActivityQuery)
            ->where('status', 'result_available')
            ->distinct()
            ->count('user_id');
        $assessmentActivity = (clone $assessmentActivityQuery)->distinct()->count('user_id');
        $assessmentStatusCounts = (clone $assessmentActivityQuery)
            ->selectRaw('status, count(distinct user_id) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $declarationQuery = EntranceExaminationResult::query()->whereNull('superseded_at');
        $period($declarationQuery, 'declared_at');
        $declarations = (clone $declarationQuery)->distinct()->count('user_id');
        $eligibility = (clone $declarationQuery)
            ->selectRaw('eligibility_group, count(distinct user_id) as aggregate')
            ->groupBy('eligibility_group')
            ->pluck('aggregate', 'eligibility_group');

        $completionEventQuery = AssessmentSession::query()->where('status', 'result_available');
        $period($completionEventQuery, 'result_available_at');

        $runs = RecommendationRun::query()
            ->when($from, fn (Builder $query) => $query->whereDate('generated_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->whereDate('generated_at', '<=', $to))
            ->get(['user_id']);

        $savedProgrammeQuery = StudentSavedProgramme::query();
        $period($savedProgrammeQuery, 'created_at');

        $recommendationGroups = RecommendationRun::query()
            ->when($from, fn (Builder $query) => $query->whereDate('generated_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->whereDate('generated_at', '<=', $to))
            ->get(['user_id', 'entrance_examination_snapshot'])
            ->groupBy(fn (RecommendationRun $run): string => (string) ($run->entrance_examination_snapshot['eligibilityGroup'] ?? 'unavailable'))
            ->map(fn ($group): int => $group->pluck('user_id')->unique()->count());

        $savedByEligibility = (clone $savedProgrammeQuery)
            ->with('user.currentEntranceExaminationResult')
            ->get()
            ->groupBy(fn (StudentSavedProgramme $save): string => (string) ($save->user?->currentEntranceExaminationResult?->eligibility_group ?? 'unavailable'))
            ->map->count();

        $sources = collect($sourceRegistry->entries($catalogues->current()));

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
            'scope' => 'institution',
            'studentCount' => $this->studentQuery()->count(),
            'entranceDeclarations' => $declarations,
            'eligibilityDistribution' => [
                'board' => (int) ($eligibility['board'] ?? 0),
                'nonBoard' => (int) ($eligibility['non_board'] ?? 0),
            ],
            'assessmentActivity' => $assessmentActivity,
            'completedAssessments' => $completedStudents,
            'assessmentCompletionRate' => $assessmentActivity > 0 ? round(($completedStudents / $assessmentActivity) * 100, 1) : 0,
            'assessmentFunnel' => [
                'started' => $assessmentActivity,
                'inProgress' => (int) ($assessmentStatusCounts['in_progress'] ?? 0),
                'processing' => (int) ($assessmentStatusCounts['preparing_result'] ?? 0),
                'resultAvailable' => (int) ($assessmentStatusCounts['result_available'] ?? 0),
                'failed' => (int) ($assessmentStatusCounts['result_failed'] ?? 0),
            ],
            'recommendationRuns' => $runs->pluck('user_id')->filter()->unique()->count(),
            'recommendationsByEligibility' => [
                'board' => (int) ($recommendationGroups['board'] ?? 0),
                'nonBoard' => (int) ($recommendationGroups['non_board'] ?? 0),
            ],
            'programmeSaves' => $savedProgrammeQuery->count(),
            'programmeSavesByEligibility' => [
                'board' => (int) ($savedByEligibility['board'] ?? 0),
                'nonBoard' => (int) ($savedByEligibility['non_board'] ?? 0),
            ],
            'catalogueGovernance' => [
                'currentSources' => $sources->where('reviewStatus', 'current')->count(),
                'reviewDueSources' => $sources->where('reviewStatus', 'review_due')->count(),
                'unverifiedSources' => $sources->where('reviewStatus', 'not_verified')->count(),
                'draftVersions' => ConfigurationVersion::query()->where('status', 'draft')->count(),
            ],
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
        $declaration = $session->entranceExaminationResult;
        $recommendation = $session->recommendationRun;

        return [
            'id' => $session->getKey(),
            'reference' => $this->reference($session),
            'studentId' => $session->user_id,
            'studentName' => $session->user?->name,
            'studentEmail' => $session->user?->email,
            'attemptNumber' => $session->attempt_number,
            'attemptCount' => (int) ($session->user?->assessment_sessions_count ?? $session->attempt_number),
            'retakeReason' => $session->retake_reason,
            'instrumentCode' => $session->instrument_code,
            'status' => $session->status,
            'answerCount' => count($session->answers ?? []),
            'questionCount' => (int) ($session->result_payload['answer_count'] ?? count($session->answers ?? [])),
            'topCode' => $this->topCode($session),
            'startedAt' => $session->started_at?->toAtomString(),
            'savedAt' => $session->saved_at?->toAtomString(),
            'submittedAt' => $session->submitted_at?->toAtomString(),
            'resultAvailableAt' => $session->result_available_at?->toAtomString(),
            'processingErrorCode' => $session->processing_error_code,
            'processingFailedAt' => $session->processing_failed_at?->toAtomString(),
            'entranceExamination' => $declaration ? [
                'resultId' => $declaration->getKey(),
                'score' => (float) $declaration->score,
                'eligibilityGroup' => $declaration->eligibility_group,
                'ruleReference' => $declaration->rule_reference,
                'source' => 'student_self_declared',
                'declaredAt' => $declaration->declared_at?->toAtomString(),
            ] : null,
            'recommendationSnapshot' => $recommendation ? [
                'catalogueReference' => $recommendation->catalogue_reference,
                'ruleReference' => $recommendation->rule_reference,
                'methodologyStatus' => $recommendation->methodology_status,
                'generatedAt' => $recommendation->generated_at?->toAtomString(),
                'totalEligible' => $recommendation->total_eligible,
            ] : null,
        ];
    }

    private function latestSessionQuery(): Builder
    {
        return AssessmentSession::query()
            ->whereIn('id', AssessmentSession::query()->selectRaw('MAX(id)')->groupBy('user_id'));
    }

    private function reference(AssessmentSession $session): string
    {
        return 'ASMT-'.str_pad((string) $session->getKey(), 6, '0', STR_PAD_LEFT);
    }

    /** @return array<string, int> */
    private function pagination(LengthAwarePaginator $paginator): array
    {
        return [
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'perPage' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem() ?? 0,
            'to' => $paginator->lastItem() ?? 0,
        ];
    }

    /** @param array<string, mixed>|null $metadata @return array<string, mixed> */
    private static function safeAuditMetadata(?array $metadata): array
    {
        if ($metadata === null) {
            return [];
        }

        $allowed = ['kind', 'version', 'status', 'sourceVersion', 'sourceName', 'lastVerifiedAt', 'format', 'dataClassification', 'from', 'to', 'beforeStatus', 'afterStatus', 'changedSections', 'changedProgrammeCount'];

        return collect($metadata)
            ->only($allowed)
            ->filter(static fn (mixed $value): bool => is_null($value) || is_scalar($value) || (is_array($value) && collect($value)->every(fn (mixed $item): bool => is_scalar($item))))
            ->all();
    }

    private static function auditSummary(AdminAuditEvent $event): string
    {
        $metadata = self::safeAuditMetadata($event->metadata);
        $parts = [];
        if (isset($metadata['kind'], $metadata['version'])) {
            $parts[] = ucfirst((string) $metadata['kind']).' version '.$metadata['version'];
        }
        if (isset($metadata['status'])) {
            $parts[] = 'status '.str_replace('_', ' ', (string) $metadata['status']);
        }
        if (isset($metadata['sourceVersion'])) {
            $parts[] = 'restored from version '.$metadata['sourceVersion'];
        }
        if (isset($metadata['sourceName'])) {
            $parts[] = (string) $metadata['sourceName'];
        }
        if (isset($metadata['beforeStatus'], $metadata['afterStatus'])) {
            $parts[] = $metadata['beforeStatus'].' to '.$metadata['afterStatus'];
        }
        if (isset($metadata['changedProgrammeCount'])) {
            $parts[] = $metadata['changedProgrammeCount'].' programme records changed';
        }

        return $parts !== [] ? implode(' · ', $parts) : str_replace(['.', '_'], ' ', $event->action);
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
