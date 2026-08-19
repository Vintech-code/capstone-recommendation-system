<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['assessment_instrument_id', 'position', 'source_number', 'riasec_code', 'prompt'])]
class AssessmentQuestion extends Model
{
    /** @return BelongsTo<AssessmentInstrument, $this> */
    public function instrument(): BelongsTo
    {
        return $this->belongsTo(AssessmentInstrument::class, 'assessment_instrument_id');
    }
}
