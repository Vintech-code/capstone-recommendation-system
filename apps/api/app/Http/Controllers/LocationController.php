<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\CityMunicipality;
use App\Models\Province;
use App\Models\Region;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

final class LocationController extends Controller
{
    public function regions(): JsonResponse
    {
        return $this->listing('regions', fn () => Region::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name'])->toArray());
    }

    public function provinces(Region $region): JsonResponse
    {
        abort_unless($region->is_active, 404);

        return $this->listing('provinces:'.$region->id, fn () => [
            'items' => $region->provinces()->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name'])->toArray(),
            'hasIndependentCities' => $region->citiesMunicipalities()->where('is_active', true)->whereNull('province_id')->exists(),
        ]);
    }

    public function cities(Province $province): JsonResponse
    {
        abort_unless($province->is_active, 404);

        return $this->listing('cities:'.$province->id, fn () => $province->citiesMunicipalities()->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name'])->toArray());
    }

    public function independentCities(Region $region): JsonResponse
    {
        abort_unless($region->is_active, 404);

        return $this->listing('independent:'.$region->id, fn () => $region->citiesMunicipalities()->where('is_active', true)->whereNull('province_id')->orderBy('name')->get(['id', 'code', 'name'])->toArray());
    }

    public function barangays(CityMunicipality $cityMunicipality): JsonResponse
    {
        abort_unless($cityMunicipality->is_active, 404);

        return $this->listing('barangays:'.$cityMunicipality->id, fn () => Barangay::where('city_municipality_id', $cityMunicipality->id)->where('is_active', true)->orderBy('name')->get(['id', 'code', 'name'])->toArray());
    }

    private function listing(string $key, callable $read): JsonResponse
    {
        $version = DB::table('location_syncs')->max('id');
        if ($version === null) {
            return response()->json(['message' => 'Location choices are temporarily unavailable. Please try again later.'], 503);
        }
        try {
            $data = Cache::remember("locations:{$version}:{$key}", config('locations.cache_ttl'), $read);
        } catch (Throwable $exception) {
            report($exception);
            $data = $read();
        }

        return response()->json(['data' => $data]);
    }
}
