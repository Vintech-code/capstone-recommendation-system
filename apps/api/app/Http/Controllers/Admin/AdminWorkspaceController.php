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
use App\Services\Admin\AdminAssessmentPresenter;
use App\Services\Admin\AdminAuditPresenter;
use App\Services\Admin\AdminReportService;
use App\Services\Assessment\ResultCardPresenter;
use App\Services\Recommendation\ProgrammeSourceRegistry;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

final class AdminWorkspaceController extends Controller
{
    public function __construct(
        private readonly AdminAssessmentPresenter $assessmentPresenter,
        private readonly AdminAuditPresenter $auditPresenter,
        private readonly AdminReportService $reportService,
    ) {
    }

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
            ->map(fn(AssessmentSession $session): array => $this->assessmentPresenter->summary($session));
        $operationalAttention = [
            'processingFailures' => (int) ($statusCounts['result_failed'] ?? 0),
            'unverifiedSources' => collect($sourceRegistry->entries($catalogues->current()))
                ->whereIn('reviewStatus', ['not_verified', 'review_due'])
                ->count(),
            'unpublishedDrafts' => ConfigurationVersion::query()->where('status', 'draft')->count(),
        ];

        return response()->json([
            'data' => [
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
            ],
        ]);
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
                        ->orWhereHas('latestAssessmentSession', fn(Builder $session) => $session
                            ->where('result_payload', 'like', "%{$search}%"));
                    if ($assessmentId !== null) {
                        $query->orWhereHas('latestAssessmentSession', fn(Builder $session) => $session->whereKey($assessmentId));
                    }
                });
            })
            ->withCount('assessmentSessions')
            ->withCount(['assessmentSessions as completed_assessment_sessions_count' => fn(Builder $q) => $q->where('status', 'result_available')])
            ->withCount('savedProgrammes')
            ->with([
                'latestAssessmentSession.recommendationRun',
                'currentEntranceExaminationResult',
                'studentProfile',
            ])
            ->when($status === 'not_started', fn(Builder $query) => $query->whereDoesntHave('assessmentSessions'))
            ->when($status !== null && $status !== 'not_started', fn(Builder $query) => $query->whereHas(
                'latestAssessmentSession',
                fn(Builder $session) => $session->where('status', $status),
            ))
            ->when($eligibility === 'not_declared', fn(Builder $query) => $query->whereDoesntHave('currentEntranceExaminationResult'))
            ->when(in_array($eligibility, ['board', 'non_board'], true), fn(Builder $query) => $query->whereHas(
                'currentEntranceExaminationResult',
                fn(Builder $result) => $result->where('eligibility_group', $eligibility),
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
                $completedCount = (int) $student->completed_assessment_sessions_count;

                return [
                    'id' => $student->getKey(),
                    'name' => $student->name,
                    'email' => $student->email,
                    'accountStatus' => $student->account_status,
                    'photoUrl' => $student->studentProfile?->photo_path
                        ? '/api/v1/profile-photos/' . $student->getKey() . '?v=' . $student->studentProfile->updated_at?->getTimestamp()
                        : $student->google_avatar_url,
                    'attemptCount' => $student->assessment_sessions_count,
                    'completedAssessmentCount' => $completedCount,
                    'retakeCount' => max(0, $completedCount - 1),
                    'latestResultAt' => $latest?->result_available_at?->toAtomString(),
                    'latestTopCode' => $latest ? $this->assessmentPresenter->topCode($latest) : null,
                    'declarationStatus' => $declaration ? 'declared' : 'required',
                    'selfDeclaredScore' => $declaration ? (float) $declaration->score : null,
                    'eligibilityGroup' => $declaration?->eligibility_group,
                    'currentAssessmentStatus' => $latest?->status ?? 'not_started',
                    'currentAssessmentReference' => $latest ? $this->assessmentPresenter->reference($latest) : null,
                    'recommendationAvailable' => $latest?->recommendationRun !== null,
                    'savedProgrammeCount' => (int) $student->saved_programmes_count,
                    'lastActivityAt' => $latest?->updated_at?->toAtomString() ?? $declaration?->declared_at?->toAtomString(),
                ];
            });

        return response()->json([
            'data' => [
                'items' => $items,
                'pagination' => $this->pagination($students),
            ],
        ]);
    }

    public function student(User $student): JsonResponse
    {
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);
        $student->loadMissing('studentProfile');

        $attempts = $student->assessmentSessions()
            ->with(['recommendationRun', 'entranceExaminationResult'])
            ->latest('attempt_number')
            ->get()
            ->map(fn(AssessmentSession $session): array => array_merge(
                $this->assessmentPresenter->summary($session),
                [
                    'dimensions' => $this->assessmentPresenter->dimensions($session),
                    'recommendations' => $session->recommendationRun?->ranked_courses ?? [],
                ],
            ));

        return response()->json([
            'data' => [
                'id' => $student->getKey(),
                'name' => $student->name,
                'email' => $student->email,
                'photoUrl' => $student->studentProfile?->photo_path
                    ? '/api/v1/profile-photos/' . $student->getKey() . '?v=' . $student->studentProfile->updated_at?->getTimestamp()
                    : $student->google_avatar_url,
                'accountStatus' => $student->account_status,
                'savedProgrammeCount' => $student->savedProgrammes()->count(),
                'profile' => $student->studentProfile ? [
                    'photoUrl' => $student->studentProfile->photo_path
                        ? '/api/v1/profile-photos/' . $student->getKey() . '?v=' . $student->studentProfile->updated_at?->getTimestamp()
                        : $student->google_avatar_url,
                    'lrn' => $student->studentProfile->lrn,
                    'birthDate' => $student->studentProfile->birth_date,
                    'age' => $student->studentProfile->birth_date
                        ? CarbonImmutable::parse($student->studentProfile->birth_date)->age
                        : null,
                    'phone' => $student->studentProfile->phone,
                    'location' => $student->studentProfile->locationSelection(),
                    'addressLine' => $student->studentProfile->address_line,
                    'barangay' => $student->studentProfile->barangay,
                    'municipality' => $student->studentProfile->municipality,
                    'province' => $student->studentProfile->province,
                    'shsSchoolName' => $student->studentProfile->shs_school_name,
                    'shsStrand' => $student->studentProfile->shs_strand,
                    'shsGraduationYear' => $student->studentProfile->shs_graduation_year,
                ] : null,
                'assessmentSummary' => [
                    'totalAttempts' => $student->assessmentSessions()->count(),
                    'completedAttempts' => $student->assessmentSessions()->where('status', 'result_available')->count(),
                    'retakeCount' => max(0, $student->assessmentSessions()->where('status', 'result_available')->count() - 1),
                    'latestAttempt' => $attempts->first() ?? null,
                ],
                'attempts' => $attempts,
            ],
        ]);
    }

    public function studentResultCard(User $student, AssessmentSession $assessmentSession, ResultCardPresenter $presenter): JsonResponse
    {
        abort_unless($student->roles()->where('slug', RoleSlug::Student->value)->exists(), 404);
        abort_unless($assessmentSession->user_id === $student->getKey(), 404);
        abort_unless($assessmentSession->status === 'result_available', 404, 'Assessment result is not available for this attempt.');

        return response()->json([
            'data' => $presenter->present($assessmentSession),
        ]);
    }

    public function programmes(TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();
        $savedCounts = StudentSavedProgramme::query()
            ->selectRaw('programme_id, count(*) as aggregate')
            ->groupBy('programme_id')
            ->pluck('aggregate', 'programme_id');

        return response()->json([
            'data' => [
                'academicYear' => $catalogue['academic_year'],
                'catalogueVersion' => $catalogue['catalogue_version'],
                'catalogueStatus' => $catalogue['catalogue_status'],
                'programmes' => array_map(static fn(array $programme): array => [
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
                    'contentStatus' => $programme['content_status'] ?? 'proposed',
                    'contentSource' => $programme['content_source'] ?? null,
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
            ],
        ]);
    }

    public function methodology(TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $catalogue = $catalogues->current();
        $policy = $catalogue['matching_policy'];

        return response()->json([
            'data' => [
                'status' => $policy['approval_status'],
                'reviewStatus' => $policy['review_status'],
                'designatedReviewer' => $policy['designated_reviewer'],
                'method' => $policy['method'],
                'formula' => $policy['formula'],
                'normalization' => $policy['normalization'],
                'eligibility' => $policy['eligibility'],
                'tieBreak' => $policy['tie_break'],
                'display' => $policy['display'],
                'catalogueReference' => 'TCC-AY-' . $catalogue['academic_year'] . '-V' . $catalogue['catalogue_version'],
            ],
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        return response()->json([
            'data' => $this->reportService->generate(
                $validated['from'] ?? null,
                $validated['to'] ?? null,
            ),
        ]);
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
            ->when(isset($validated['actor']), fn(Builder $query) => $query->where('actor_id', $validated['actor']))
            ->when(isset($validated['action']), fn(Builder $query) => $query->where('action', $validated['action']))
            ->when(isset($validated['subjectType']), fn(Builder $query) => $query->where('subject_type', $validated['subjectType']))
            ->when(isset($validated['from']), fn(Builder $query) => $query->whereDate('created_at', '>=', $validated['from']))
            ->when(isset($validated['to']), fn(Builder $query) => $query->whereDate('created_at', '<=', $validated['to']))
            ->latest()
            ->paginate((int) ($validated['perPage'] ?? 25));
        $items = $events->getCollection()
            ->map(fn(AdminAuditEvent $event): array => [
                'id' => $event->getKey(),
                'actorId' => $event->actor_id,
                'actor' => $event->actor?->name,
                'action' => $event->action,
                'subjectType' => $event->subject_type,
                'subjectReference' => $event->subject_reference,
                'summary' => $this->auditPresenter->summary($event),
                'metadata' => $this->auditPresenter->safeMetadata($event->metadata),
                'createdAt' => $event->created_at?->toAtomString(),
            ]);

        return response()->json([
            'data' => [
                'items' => $items,
                'pagination' => $this->pagination($events),
                'filters' => [
                    'actors' => AdminAuditEvent::query()->with('actor:id,name')->get()->pluck('actor')->filter()->unique('id')->values()->map(fn(User $actor) => ['id' => $actor->getKey(), 'name' => $actor->name]),
                    'actions' => AdminAuditEvent::query()->distinct()->orderBy('action')->pluck('action'),
                    'subjectTypes' => AdminAuditEvent::query()->distinct()->orderBy('subject_type')->pluck('subject_type'),
                ],
            ],
        ]);
    }

    /** @return Builder<User> */
    private function studentQuery(): Builder
    {
        return User::query()->whereHas('roles', static fn(Builder $query) => $query->where('slug', RoleSlug::Student->value));
    }

    private function latestSessionQuery(): Builder
    {
        return AssessmentSession::query()
            ->whereIn('id', AssessmentSession::query()->selectRaw('MAX(id)')->groupBy('user_id'));
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
}
