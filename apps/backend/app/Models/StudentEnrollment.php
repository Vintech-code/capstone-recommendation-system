<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentEnrollment extends Model
{
    use HasFactory;

    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'recommendation_run_id',
        'enrolled_programme_id',
        'student_id_number',
        'cor_reference',
        'cor_file_path',
        'cor_original_name',
        'declared_at',
        'verification_status',
        'verification_note',
        'verified_at',
        'verified_by',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'declared_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<RecommendationRun, $this> */
    public function recommendationRun(): BelongsTo
    {
        return $this->belongsTo(RecommendationRun::class);
    }
}
