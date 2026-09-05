<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\ConfigurationVersion;
use App\Services\Notifications\NotificationPolicyScheduler;
use App\Services\Recommendation\ProgrammeSourceRegistry;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class AdminConfigurationController extends Controller
{
    public function index(
        string $kind,
        TccProgrammeCatalogueRepository $catalogues,
        ProgrammeSourceRegistry $sources,
    ): JsonResponse {
        $this->ensureKind($kind);
        $current = $catalogues->current();
        $versions = ConfigurationVersion::query()
            ->where('kind', $kind)
            ->with(['creator:id,name', 'publisher:id,name'])
            ->latest('version')
            ->get()
            ->map(fn (ConfigurationVersion $version): array => $this->payload($version));

        $workspace = [
            'kind' => $kind,
            'runtime' => $kind === 'catalogue' ? $current : $current['matching_policy'],
            'versions' => $versions,
        ];
        if ($kind === 'catalogue') {
            $workspace['sourceRegistry'] = $sources->entries($current);
        }

        return response()->json(['data' => $workspace]);
    }

    public function store(Request $request, string $kind, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $this->ensureKind($kind);
        $validated = $request->validate(['sourceVersionId' => ['nullable', 'integer']]);
        $existingDraft = ConfigurationVersion::query()
            ->where('kind', $kind)
            ->where('status', 'draft')
            ->with('creator:id,name')
            ->first();

        if ($existingDraft !== null) {
            return response()->json([
                'data' => $this->payload($existingDraft),
                'message' => 'The existing draft is ready to continue editing.',
            ]);
        }

        $current = $catalogues->current();
        $source = isset($validated['sourceVersionId'])
            ? ConfigurationVersion::query()->where('kind', $kind)->findOrFail($validated['sourceVersionId'])
            : null;
        $version = ConfigurationVersion::query()->create([
            'kind' => $kind,
            'version' => ((int) ConfigurationVersion::query()->where('kind', $kind)->max('version')) + 1,
            'status' => 'draft',
            'academic_year' => $current['academic_year'] ?? null,
            'payload' => $source?->payload ?? ($kind === 'catalogue' ? $current : $current['matching_policy']),
            'created_by' => $request->user()->getKey(),
        ]);
        $this->audit($request, 'configuration.draft_created', $version, $source?->version);

        return response()->json(['data' => $this->payload($version->load('creator:id,name'))], 201);
    }

    public function update(Request $request, ConfigurationVersion $configurationVersion, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        abort_unless($configurationVersion->status === 'draft', 409, 'Only a draft configuration can be changed.');
        $validated = $request->validate(['payload' => ['required', 'array']]);
        $payload = $configurationVersion->kind === 'catalogue'
            ? $this->preserveApiFields($validated['payload'], $catalogues->current())
            : $validated['payload'];
        $this->validatePayload($configurationVersion->kind, $payload);
        $changes = $this->diff($configurationVersion->payload, $payload);
        $configurationVersion->update(['payload' => $payload]);
        $this->audit($request, 'configuration.draft_updated', $configurationVersion, null, [
            'changedSections' => $changes['changedSections'],
            'changedProgrammeCount' => $changes['changedProgrammeCount'],
        ]);

        return response()->json(['data' => $this->payload($configurationVersion->fresh('creator:id,name'))]);
    }

    public function publish(Request $request, ConfigurationVersion $configurationVersion, NotificationPolicyScheduler $notificationPolicies): JsonResponse
    {
        abort_unless($configurationVersion->status === 'draft', 409, 'Only a draft configuration can be published.');
        $this->validatePayload($configurationVersion->kind, $configurationVersion->payload);

        $previousPayload = ConfigurationVersion::query()
            ->where('kind', $configurationVersion->kind)
            ->where('status', 'published')
            ->value('payload');

        DB::transaction(function () use ($configurationVersion, $request): void {
            ConfigurationVersion::query()
                ->where('kind', $configurationVersion->kind)
                ->where('status', 'published')
                ->update(['status' => 'archived']);
            $configurationVersion->update([
                'status' => 'published',
                'published_by' => $request->user()->getKey(),
                'published_at' => now(),
            ]);
            $this->audit($request, 'configuration.published', $configurationVersion, null, [
                'beforeStatus' => 'draft',
                'afterStatus' => 'published',
            ]);
        });

        try {
            $notificationPolicies->queuePublishedProgrammeUpdates(
                $configurationVersion->fresh(),
                is_array($previousPayload) ? $previousPayload : null,
            );
        } catch (\Throwable $exception) {
            report($exception);
        }

        return response()->json(['data' => $this->payload($configurationVersion->fresh(['creator:id,name', 'publisher:id,name']))]);
    }

    public function preview(
        Request $request,
        ConfigurationVersion $configurationVersion,
        TccProgrammeCatalogueRepository $catalogues,
    ): JsonResponse {
        abort_unless($configurationVersion->status === 'draft', 409, 'Only a draft configuration can be previewed.');
        $validated = $request->validate(['payload' => ['sometimes', 'array']]);
        $payload = $validated['payload'] ?? $configurationVersion->payload;
        if ($configurationVersion->kind === 'catalogue') {
            $payload = $this->preserveApiFields($payload, $catalogues->current());
        }
        $this->validatePayload($configurationVersion->kind, $payload);

        return response()->json(['data' => $this->diff(
            $configurationVersion->kind === 'catalogue' ? $catalogues->current() : $catalogues->current()['matching_policy'],
            $payload,
        )]);
    }

    public function rollback(Request $request, ConfigurationVersion $configurationVersion): JsonResponse
    {
        abort_unless(in_array($configurationVersion->status, ['published', 'archived'], true), 409, 'Only a published or archived version can be restored.');
        abort_if(
            ConfigurationVersion::query()->where('kind', $configurationVersion->kind)->where('status', 'draft')->exists(),
            409,
            'Resolve the existing draft before restoring a historical version.',
        );
        $currentPublished = ConfigurationVersion::query()
            ->where('kind', $configurationVersion->kind)
            ->where('status', 'published')
            ->value('id');
        abort_if($currentPublished === $configurationVersion->getKey(), 409, 'This version is already published.');

        $draft = ConfigurationVersion::query()->create([
            'kind' => $configurationVersion->kind,
            'version' => ((int) ConfigurationVersion::query()->where('kind', $configurationVersion->kind)->max('version')) + 1,
            'status' => 'draft',
            'academic_year' => $configurationVersion->academic_year,
            'payload' => $configurationVersion->payload,
            'created_by' => $request->user()->getKey(),
        ]);
        $this->audit($request, 'configuration.rollback_draft_created', $draft, $configurationVersion->version);

        return response()->json(['data' => $this->payload($draft->load('creator:id,name'))], 201);
    }

    private function ensureKind(string $kind): void
    {
        abort_unless(in_array($kind, ['catalogue', 'methodology'], true), 404);
    }

    /** @param array<string, mixed> $payload @param array<string, mixed> $runtime @return array<string, mixed> */
    private function preserveApiFields(array $payload, array $runtime): array
    {
        $locked = collect($runtime['programmes'] ?? [])->keyBy('id');
        $payload['programmes'] = array_map(static function (array $programme) use ($locked): array {
            $source = $locked->get($programme['id'] ?? '', []);
            foreach (['eligibility_group', 'degree_type', 'duration', 'salary', 'job_growth', 'outlook_version'] as $field) {
                $programme[$field] = $source[$field] ?? null;
            }

            return $programme;
        }, $payload['programmes'] ?? []);

        return $payload;
    }

    /** @param array<string, mixed> $payload */
    private function validatePayload(string $kind, array $payload): void
    {
        if ($kind === 'catalogue') {
            $programmes = $payload['programmes'] ?? null;
            if (! is_array($programmes) || count($programmes) !== 11) {
                throw ValidationException::withMessages(['payload.programmes' => 'The catalogue must contain all 11 configured programmes.']);
            }
            foreach ($programmes as $programme) {
                $profile = $programme['riasec_profile'] ?? [];
                if (! is_array($profile) || $profile === [] || array_diff($profile, ['R', 'I', 'A', 'S', 'E', 'C']) !== []) {
                    throw ValidationException::withMessages(['payload.programmes' => 'Every programme requires a valid RIASEC profile.']);
                }
                $opportunities = $programme['career_opportunities'] ?? [];
                if (! is_array($opportunities)) {
                    throw ValidationException::withMessages(['payload.programmes' => 'Career opportunities must be a list.']);
                }
                if (count($opportunities) > 8) {
                    throw ValidationException::withMessages(['payload.programmes' => 'Each programme can publish up to eight ESCO career opportunities.']);
                }
                foreach ($opportunities as $opportunity) {
                    $skills = is_array($opportunity) && is_array($opportunity['skills'] ?? null) ? $opportunity['skills'] : null;
                    if (! is_array($opportunity)
                        || ! is_string($opportunity['label'] ?? null)
                        || trim($opportunity['label']) === ''
                        || mb_strlen($opportunity['label']) > 160
                        || ! is_string($opportunity['description'] ?? null)
                        || mb_strlen($opportunity['description']) > 2000
                        || ! is_string($opportunity['escoUri'] ?? null)
                        || ! str_starts_with($opportunity['escoUri'], 'http://data.europa.eu/esco/occupation/')
                        || $skills === null
                        || count($skills) > 6
                        || collect($skills)->contains(fn (mixed $skill): bool => ! is_string($skill) || trim($skill) === '' || mb_strlen($skill) > 160)
                        || ($opportunity['source'] ?? null) !== 'esco'
                        || ! is_string($opportunity['sourceLanguage'] ?? null)
                        || ! preg_match('/^[a-z]{2}(?:-[a-z]{2})?$/', $opportunity['sourceLanguage'])
                        || ! is_string($opportunity['sourceVersion'] ?? null)
                        || ! preg_match('/^v[0-9]+\.[0-9]+\.[0-9]+$/', $opportunity['sourceVersion'])
                        || ! is_string($opportunity['retrievedAt'] ?? null)
                        || strtotime($opportunity['retrievedAt']) === false
                        || ($opportunity['reviewStatus'] ?? null) !== 'proposed') {
                        throw ValidationException::withMessages(['payload.programmes' => 'Every ESCO career opportunity requires bounded source fields, a valid occupation URI and taxonomy version, and proposed review status.']);
                    }
                }
                foreach (['cover_image_position', 'logo_image_position'] as $field) {
                    if (isset($programme[$field]) && ! $this->validMediaPosition($programme[$field])) {
                        throw ValidationException::withMessages(["payload.programmes.{$field}" => 'Image framing requires x and y values from 0 to 100 and zoom from 1 to 2.5.']);
                    }
                }
            }
        } elseif (! isset($payload['method'], $payload['normalization'], $payload['tie_break'], $payload['display'])) {
            throw ValidationException::withMessages(['payload' => 'The methodology payload is incomplete.']);
        }
    }

    private function validMediaPosition(mixed $position): bool
    {
        return is_array($position)
            && is_numeric($position['x'] ?? null)
            && is_numeric($position['y'] ?? null)
            && is_numeric($position['zoom'] ?? null)
            && (float) $position['x'] >= 0
            && (float) $position['x'] <= 100
            && (float) $position['y'] >= 0
            && (float) $position['y'] <= 100
            && (float) $position['zoom'] >= 1
            && (float) $position['zoom'] <= 2.5;
    }

    /** @return array<string, mixed> */
    private function payload(ConfigurationVersion $version): array
    {
        return [
            'id' => $version->getKey(),
            'kind' => $version->kind,
            'version' => $version->version,
            'status' => $version->status,
            'academicYear' => $version->academic_year,
            'payload' => $version->payload,
            'createdBy' => $version->creator?->name,
            'publishedBy' => $version->publisher?->name,
            'createdAt' => $version->created_at?->toAtomString(),
            'publishedAt' => $version->published_at?->toAtomString(),
        ];
    }

    /** @param array<string, mixed> $baseline @param array<string, mixed> $candidate @return array<string, mixed> */
    private function diff(array $baseline, array $candidate): array
    {
        $changedSections = collect(array_unique([...array_keys($baseline), ...array_keys($candidate)]))
            ->filter(fn (string $key): bool => $this->different($baseline[$key] ?? null, $candidate[$key] ?? null))
            ->values()
            ->all();
        $baselineProgrammes = collect($baseline['programmes'] ?? [])->keyBy('id');
        $candidateProgrammes = collect($candidate['programmes'] ?? [])->keyBy('id');
        $programmeChanges = $candidateProgrammes->map(function (array $programme, string $id) use ($baselineProgrammes): array {
            $before = $baselineProgrammes->get($id, []);
            $fields = collect(array_unique([...array_keys($before), ...array_keys($programme)]))
                ->filter(fn (string $field): bool => $this->different($before[$field] ?? null, $programme[$field] ?? null))
                ->map(fn (string $field): array => [
                    'field' => $field,
                    'before' => $before[$field] ?? null,
                    'after' => $programme[$field] ?? null,
                ])->values()->all();

            return [
                'programmeId' => $id,
                'code' => $programme['short_label'] ?? null,
                'name' => $programme['display_name'] ?? null,
                'fields' => $fields,
            ];
        })->filter(fn (array $change): bool => $change['fields'] !== [])->values()->all();

        return [
            'hasChanges' => $changedSections !== [],
            'changedSections' => $changedSections,
            'changedProgrammeCount' => count($programmeChanges),
            'programmeChanges' => $programmeChanges,
        ];
    }

    private function different(mixed $before, mixed $after): bool
    {
        return json_encode($before, JSON_THROW_ON_ERROR) !== json_encode($after, JSON_THROW_ON_ERROR);
    }

    /** @param array<string, mixed> $summary */
    private function audit(Request $request, string $action, ConfigurationVersion $version, ?int $sourceVersion = null, array $summary = []): void
    {
        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => $action,
            'subject_type' => 'configuration_version',
            'subject_reference' => $version->kind.'-v'.$version->version,
            'metadata' => array_merge(['kind' => $version->kind, 'version' => $version->version, 'status' => $version->status, 'sourceVersion' => $sourceVersion], $summary),
        ]);
    }
}
