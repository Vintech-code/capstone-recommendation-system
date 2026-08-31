<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'account_status', 'status_changed_at', 'must_change_password', 'privacy_anonymized_at'])]
#[Hidden(['password', 'remember_token', 'google_id'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /** @var array<string, mixed> */
    protected $attributes = [
        'account_status' => 'active',
    ];

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
            'must_change_password' => 'boolean',
            'privacy_anonymized_at' => 'datetime',
        ];
    }
}
