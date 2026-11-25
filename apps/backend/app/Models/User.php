<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['first_name', 'last_name', 'name', 'email', 'password', 'account_status', 'status_changed_at', 'can_manage_administrators', 'privacy_anonymized_at', 'google_avatar_url', 'admin_photo_path'])]
#[Hidden(['password', 'remember_token', 'google_id'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, MustVerifyEmailTrait, Notifiable;

    /** @var array<string, mixed> */
    protected $attributes = [
        'account_status' => 'active',
    ];

    public function fullName(): string
    {
        $splitName = trim(implode(' ', array_filter([
            $this->getAttribute('first_name'),
            $this->getAttribute('last_name'),
        ], static fn (mixed $part): bool => is_string($part) && trim($part) !== '')));

        return $splitName !== '' ? $splitName : trim((string) $this->getRawOriginal('name'));
    }

    /** @return array{0: string, 1: string} */
    public static function splitDisplayName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name), 2) ?: [];

        return [$parts[0] ?? 'User', $parts[1] ?? ''];
    }

    public function getNameAttribute(): string
    {
        return $this->fullName();
    }

    public function setNameAttribute(string $name): void
    {
        [$firstName, $lastName] = self::splitDisplayName($name);
        $this->attributes['first_name'] = $firstName;
        $this->attributes['last_name'] = $lastName;
        $this->attributes['name'] = trim($firstName.' '.$lastName);
    }

    /**
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /** @return HasMany<AssessmentSession, $this> */
    public function assessmentSessions(): HasMany
    {
        return $this->hasMany(AssessmentSession::class);
    }

    /** @return HasOne<AssessmentSession, $this> */
    public function latestAssessmentSession(): HasOne
    {
        return $this->hasOne(AssessmentSession::class)->ofMany('attempt_number', 'max');
    }

    /** @return HasMany<EntranceExaminationResult, $this> */
    public function entranceExaminationResults(): HasMany
    {
        return $this->hasMany(EntranceExaminationResult::class);
    }

    /** @return HasOne<EntranceExaminationResult, $this> */
    public function currentEntranceExaminationResult(): HasOne
    {
        return $this->hasOne(EntranceExaminationResult::class)
            ->whereNull('superseded_at')
            ->latestOfMany();
    }

    /** @return HasMany<RecommendationRun, $this> */
    public function recommendationRuns(): HasMany
    {
        return $this->hasMany(RecommendationRun::class);
    }

    /** @return HasMany<RecommendationFeedback, $this> */
    public function recommendationFeedback(): HasMany
    {
        return $this->hasMany(RecommendationFeedback::class);
    }

    /** @return HasMany<StudentSavedProgramme, $this> */
    public function savedProgrammes(): HasMany
    {
        return $this->hasMany(StudentSavedProgramme::class);
    }

    /** @return HasOne<StudentProfile, $this> */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    /** @return HasOne<StudentEnrollment, $this> */
    public function enrollment(): HasOne
    {
        return $this->hasOne(StudentEnrollment::class);
    }

    public function hasRole(RoleSlug $role): bool
    {
        return $this->roles->contains('slug', $role->value);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status_changed_at' => 'datetime',
            'can_manage_administrators' => 'boolean',
            'privacy_anonymized_at' => 'datetime',
        ];
    }
}
