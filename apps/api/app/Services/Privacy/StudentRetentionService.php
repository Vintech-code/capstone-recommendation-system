<?php

namespace App\Services\Privacy;

use App\Models\RoleSlug;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class StudentRetentionService
{
    /** @return array<int, array{studentId: int, lastActivityAt: string}> */
    public function candidates(): array
    {
        $cutoff = CarbonImmutable::now()->subYears(max(1, (int) config('pathways.student_retention_years', 5)));

        return User::query()
            ->whereNull('privacy_anonymized_at')
            ->whereHas('roles', static fn (Builder $query) => $query->where('slug', RoleSlug::Student->value))
            ->get()
            ->map(fn (User $student): array => [
                'studentId' => (int) $student->getKey(),
                'lastActivityAt' => $this->lastActivityAt($student)->toAtomString(),
            ])
            ->filter(static fn (array $student): bool => CarbonImmutable::parse($student['lastActivityAt'])->lessThanOrEqualTo($cutoff))
            ->values()
            ->all();
    }

    public function anonymize(User $student): void
    {
        abort_unless($student->hasRole(RoleSlug::Student), 422, 'Only Student Applicant records are governed by this retention operation.');
        abort_if($student->privacy_anonymized_at !== null, 409, 'The Student record is already anonymized.');

        DB::transaction(function () use ($student): void {
            $profile = $student->studentProfile()->first();
            if ($profile?->photo_path) {
                Storage::disk('local')->delete($profile->photo_path);
            }
            $profile?->update(['photo_path' => null, 'strengths' => [], 'growth_areas' => [], 'learning_preferences' => []]);

            $caseIds = DB::table('guidance_cases')->where('student_id', $student->getKey())->pluck('id');
            DB::table('guidance_notes')->whereIn('guidance_case_id', $caseIds)->update(['body' => '[Removed under the approved retention policy]']);
            DB::table('guidance_summaries')->whereIn('guidance_case_id', $caseIds)->update(['body' => '[Removed under the approved retention policy]']);
            DB::table('guidance_requests')->where('student_id', $student->getKey())->update(['message' => '[Removed under the approved retention policy]']);
            DB::table('guidance_appointments')->where('student_id', $student->getKey())->update(['topic' => 'Archived guidance appointment', 'notes' => null]);
            DB::table('notifications')->where('notifiable_type', User::class)->where('notifiable_id', $student->getKey())->delete();
            DB::table('sessions')->where('user_id', $student->getKey())->delete();
            $student->tokens()->delete();

            $student->forceFill([
                'name' => 'Archived Student '.$student->getKey(),
                'email' => 'archived-student-'.$student->getKey().'@invalid.local',
                'password' => Str::random(64),
                'account_status' => 'suspended',
                'status_changed_at' => now(),
                'privacy_anonymized_at' => now(),
                'remember_token' => null,
            ])->save();
        });
    }

    private function lastActivityAt(User $student): CarbonImmutable
    {
        $timestamps = collect([$student->updated_at, $student->created_at]);
        foreach (['assessment_sessions' => 'user_id', 'recommendation_runs' => 'user_id', 'student_saved_programmes' => 'user_id', 'student_profiles' => 'user_id', 'guidance_cases' => 'student_id', 'guidance_requests' => 'student_id', 'guidance_appointments' => 'student_id'] as $table => $column) {
            $timestamps->push(DB::table($table)->where($column, $student->getKey())->max('updated_at'));
        }

        return CarbonImmutable::parse($timestamps->filter()->max());
    }
}
