<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'code', 'version', 'name', 'instructions', 'scoring_method', 'status',
    'source_name', 'source_asset', 'source_url', 'source_accessed_on', 'scoring_config', 'is_active',
])]
class AssessmentInstrument extends Model
{
    /** @return HasMany<AssessmentQuestion, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(AssessmentQuestion::class)->orderBy('position');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'source_accessed_on' => 'date',
            'scoring_config' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
