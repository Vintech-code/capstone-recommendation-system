<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditEvent;
use App\Models\ConfigurationVersion;
use App\Services\Recommendation\TccProgrammeCatalogueRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class AdminConfigurationController extends Controller
{
    public function index(string $kind, TccProgrammeCatalogueRepository $catalogues): JsonResponse
    {
        $this->ensureKind($kind);
        $current = $catalogues->current();
        $versions = ConfigurationVersion::query()
            ->where('kind', $kind)
            ->with(['creator:id,name', 'publisher:id,name'])
            ->latest('version')
            ->get()
            ->map(fn (ConfigurationVersion $version): array => $this->payload($version));

        return response()->json(['data' => [
            'kind' => $kind,
            'runtime' => $kind === 'catalogue' ? $current : $current['matching_policy'],
            'versions' => $versions,
        ]]);
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
        $configurationVersion->update(['payload' => $payload]);
        $this->audit($request, 'configuration.draft_updated', $configurationVersion);

        return response()->json(['data' => $this->payload($configurationVersion->fresh('creator:id,name'))]);
    }

    public function publish(Request $request, ConfigurationVersion $configurationVersion): JsonResponse
    {
        abort_unless($configurationVersion->status === 'draft', 409, 'Only a draft configuration can be published.');
        $this->validatePayload($configurationVersion->kind, $configurationVersion->payload);

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
            $this->audit($request, 'configuration.published', $configurationVersion);
        });

        return response()->json(['data' => $this->payload($configurationVersion->fresh(['creator:id,name', 'publisher:id,name']))]);
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
            foreach (['degree_type', 'duration', 'salary', 'job_growth', 'outlook_version'] as $field) {
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
            }
        } elseif (! isset($payload['method'], $payload['normalization'], $payload['tie_break'], $payload['display'])) {
            throw ValidationException::withMessages(['payload' => 'The methodology payload is incomplete.']);
        }
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

    private function audit(Request $request, string $action, ConfigurationVersion $version, ?int $sourceVersion = null): void
    {
        AdminAuditEvent::query()->create([
            'actor_id' => $request->user()->getKey(),
            'action' => $action,
            'subject_type' => 'configuration_version',
            'subject_reference' => $version->kind.'-v'.$version->version,
            'metadata' => ['kind' => $version->kind, 'version' => $version->version, 'status' => $version->status, 'sourceVersion' => $sourceVersion],
        ]);
    }
}
