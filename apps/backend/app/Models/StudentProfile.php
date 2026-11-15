<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'photo_path',
    'id_number',
    'id_number_lookup_hash',
    'birth_date',
    'phone',
    'address_line',
    'barangay',
    'barangay_id',
    'municipality',
    'province',
])]
class StudentProfile extends Model
{
    public function locationBarangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class, 'barangay_id');
    }

    public function locationSelection(): ?array
    {
        $barangay = $this->locationBarangay;
        if (! $barangay) {
            return null;
        }
        $city = $barangay->cityMunicipality;

        return [
            'regionId' => $city->region_id,
            'provinceId' => $city->province_id,
            'cityMunicipalityId' => $city->id,
            'barangayId' => $barangay->id,
            'code' => $barangay->code,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'id_number' => 'encrypted',
            'birth_date' => 'encrypted',
            'phone' => 'encrypted',
            'address_line' => 'encrypted',
            'barangay' => 'encrypted',
            'municipality' => 'encrypted',
            'province' => 'encrypted',
        ];
    }
}
