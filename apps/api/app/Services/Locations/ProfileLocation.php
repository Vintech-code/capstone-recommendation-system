<?php

namespace App\Services\Locations;

use App\Models\Barangay;
use Illuminate\Validation\ValidationException;

final class ProfileLocation
{
    public function attributes(array $selection): array
    {
        $barangay = Barangay::with(['cityMunicipality.region', 'cityMunicipality.province'])->find($selection['barangayId']);
        $city = $barangay?->cityMunicipality;
        if (! $barangay?->is_active || ! $city?->is_active || ! $city->region->is_active
            || ($city->province_id !== null && ! $city->province?->is_active)
            || $city->id !== (int) $selection['cityMunicipalityId']
            || $city->region_id !== (int) $selection['regionId']
            || $city->province_id !== ($selection['provinceId'] === null ? null : (int) $selection['provinceId'])) {
            throw ValidationException::withMessages(['location.barangayId' => 'Select a barangay belonging to the selected region, province, and city or municipality.']);
        }

        return [
            'barangay_id' => $barangay->id,
            'barangay' => $barangay->name,
            'municipality' => $city->name,
            'province' => $city->province?->name,
        ];
    }
}
