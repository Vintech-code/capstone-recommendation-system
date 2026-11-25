<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgrammeAvailability extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'programme_id',
        'is_enrollment_open',
        'status_note',
        'updated_by',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'is_enrollment_open' => 'boolean',
        ];
    }
}
