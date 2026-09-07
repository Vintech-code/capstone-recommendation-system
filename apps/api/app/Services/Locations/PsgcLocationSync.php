<?php

namespace App\Services\Locations;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

final class PsgcLocationSync
{
    private int $normalizedProvinceConflicts = 0;

    public function sync(): array
    {
        $this->normalizedProvinceConflicts = 0;
        // The live global barangay endpoint is capped at 100 and ignores pagination.
        // Use documented region-scoped lists and verify their detail counts instead.
        $resources = [];
        foreach (['regions', 'provinces', 'cities-municipalities'] as $resource) {
            $resources[$resource] = $this->collection($resource);
        }
        $resources['barangays'] = [];
        $resources = $this->normalizeParents($resources);
        foreach ($resources['regions'] as $region) {
            $detail = $this->request('regions/'.$region['code'])['data'] ?? null;
            if (! is_array($detail) || ($detail['code'] ?? null) !== $region['code']
                || ! is_int($detail['barangays_count'] ?? null) || $detail['barangays_count'] < 0) {
                throw new RuntimeException('Invalid PSGC region detail counts.');
            }
            $barangays = $this->collection('regions/'.$region['code'].'/barangays', true);
            if (count($barangays) !== $detail['barangays_count']) {
                throw new RuntimeException('Incomplete PSGC barangay collection for region '.$region['code'].'.');
            }
            foreach ($barangays as $code => $barangay) {
                if (isset($resources['barangays'][$code])) {
                    throw new RuntimeException('Duplicate barangay across PSGC regions.');
                }
                $parent = $barangay['region'] ?? null;
                if ($parent !== $region['name'] && (! is_array($parent) || ($parent['code'] ?? null) !== $region['code'])) {
                    throw new RuntimeException('Barangay does not belong to its source region.');
                }
                $resources['barangays'][$code] = $barangay;
            }
        }
        if ($resources['barangays'] === []) {
            throw new RuntimeException('The PSGC barangay catalogue is empty.');
        }
        $resources = $this->normalizeParents($resources);
        if ($this->normalizedProvinceConflicts > 0) {
            Log::warning('PSGC records with a province outside their province-less region were normalized to no province.', [
                'normalized_records' => $this->normalizedProvinceConflicts,
            ]);
        }

        return DB::transaction(function () use ($resources): array {
            $maps = [];
            $counts = [];
            foreach (['regions' => 'regions', 'provinces' => 'provinces', 'cities-municipalities' => 'city_municipalities', 'barangays' => 'barangays'] as $resource => $table) {
                $rows = [];
                foreach ($resources[$resource] as $row) {
                    $values = ['code' => $row['code'], 'name' => $row['name'], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()];
                    if ($resource === 'provinces' || $resource === 'cities-municipalities') {
                        $values['region_id'] = $this->parentId($row, 'region', $maps['regions']);
                    }
                    if ($resource === 'cities-municipalities') {
                        if (! array_key_exists('province', $row) || ! is_string($row['type'] ?? null) || strlen($row['type']) > 32) {
                            throw new RuntimeException('Missing city/municipality province or type.');
                        }
                        $values['province_id'] = $row['province'] === null ? null : $this->parentId($row, 'province', $maps['provinces']);
                        if ($values['province_id'] !== null && $resources['provinces'][$row['province']['code']]['region']['code'] !== $row['region']['code']) {
                            throw new RuntimeException('City/municipality ancestry mismatch.');
                        }
                        $values['type'] = $row['type'];
                    }
                    if ($resource === 'barangays') {
                        $values['city_municipality_id'] = $this->parentId($row, 'city_municipality', $maps['cities-municipalities']);
                        $city = $resources['cities-municipalities'][$row['city_municipality']['code']];
                        if (($row['region']['code'] ?? null) !== $city['region']['code']
                            || ! array_key_exists('province', $row)
                            || ($row['province']['code'] ?? null) !== ($city['province']['code'] ?? null)) {
                            throw new RuntimeException('Barangay ancestry mismatch.');
                        }
                        $values['status'] = $row['status'] ?? null;
                        if ($values['status'] !== null && (! is_string($values['status']) || strlen($values['status']) > 64)) {
                            throw new RuntimeException('Invalid barangay status.');
                        }
                    }
                    $rows[] = $values;
                }
                DB::table($table)->update(['is_active' => false]);
                foreach (array_chunk($rows, 500) as $chunk) {
                    DB::table($table)->upsert($chunk, ['code'], array_diff(array_keys($chunk[0]), ['code', 'created_at']));
                }
                $maps[$resource] = DB::table($table)->where('is_active', true)->pluck('id', 'code')->all();
                $counts[$resource] = count($rows);
            }
            DB::table('location_syncs')->insert(['synced_at' => now(), 'counts' => json_encode($counts, JSON_THROW_ON_ERROR)]);

            return $counts;
        });
    }

    private function request(string $path): array
    {
        $response = Http::acceptJson()->connectTimeout(10)->timeout(config('locations.timeout'))
            ->retry(3, 1000)->get(config('locations.base_url').'/'.$path)->throw()->json();
        if (! is_array($response)) {
            throw new RuntimeException('Invalid PSGC v2 response.');
        }

        return $response;
    }

    private function collection(string $path, bool $allowEmpty = false): array
    {
        $response = $this->request($path);
        if (! isset($response['data']) || ! is_array($response['data']) || ! array_is_list($response['data'])
            || (! $allowEmpty && $response['data'] === []) || ! empty($response['links']['next'])
            || (isset($response['meta']['total']) && $response['meta']['total'] !== count($response['data']))) {
            throw new RuntimeException("Incomplete PSGC v2 collection: {$path}.");
        }
        $rows = [];
        foreach ($response['data'] as $row) {
            if (! is_array($row) || ! is_string($row['code'] ?? null) || ! preg_match('/^\d{10}$/D', $row['code'])
                || ! is_string($row['name'] ?? null) || trim($row['name']) === '' || mb_strlen($row['name']) > 255
                || isset($rows[$row['code']])) {
                throw new RuntimeException("Invalid or duplicate PSGC record: {$path}.");
            }
            $rows[$row['code']] = $row;
        }

        return $rows;
    }

    private function normalizeParents(array $resources): array
    {
        $regions = $this->nameIndex($resources['regions']);
        foreach ($resources['provinces'] as &$province) {
            $province['region'] = $this->reference($province['region'] ?? null, $regions, 'region');
        }
        unset($province);
        $provinces = $this->nameIndex($resources['provinces']);
        foreach ($resources['cities-municipalities'] as &$city) {
            $city['region'] = $this->reference($city['region'] ?? null, $regions, 'region');
            if (! array_key_exists('province', $city)) {
                throw new RuntimeException('Missing city/municipality province.');
            }
            $city['province'] = $this->normalizeProvinceReference(
                $city['province'],
                $city['region'],
                $provinces,
                $resources['provinces'],
                $city['code'],
            );
        }
        unset($city);
        $cities = [];
        foreach ($resources['cities-municipalities'] as $city) {
            $scope = $city['region']['code'].'|'.($city['province']['code'] ?? '');
            $cities[$scope][] = $city;
        }
        foreach ($cities as $scope => $items) {
            $cities[$scope] = $this->nameIndex($items);
        }
        foreach ($resources['barangays'] as &$barangay) {
            $barangay['region'] = $this->reference($barangay['region'] ?? null, $regions, 'region');
            if (! array_key_exists('province', $barangay)) {
                throw new RuntimeException('Missing barangay province.');
            }
            $barangay['province'] = $this->normalizeProvinceReference(
                $barangay['province'],
                $barangay['region'],
                $provinces,
                $resources['provinces'],
                $barangay['code'],
            );
            $scope = $barangay['region']['code'].'|'.($barangay['province']['code'] ?? '');
            $barangay['city_municipality'] = $this->reference($barangay['city_municipality'] ?? null, $cities[$scope] ?? [], 'city/municipality');
        }
        unset($barangay);

        return $resources;
    }

    private function normalizeProvinceReference(
        mixed $value,
        array $region,
        array $provinceIndex,
        array $provinces,
        string $recordCode,
    ): ?array {
        if ($value === null) {
            return null;
        }

        $province = $this->reference($value, $provinceIndex, 'province');
        if (($provinces[$province['code']]['region']['code'] ?? null) === $region['code']) {
            return $province;
        }

        $regionHasProvinces = collect($provinces)->contains(
            static fn (array $candidate): bool => ($candidate['region']['code'] ?? null) === $region['code'],
        );
        if ($regionHasProvinces) {
            throw new RuntimeException("PSGC record {$recordCode} names a province outside its region; no location data was changed.");
        }

        $this->normalizedProvinceConflicts++;

        return null;
    }

    private function nameIndex(array $rows): array
    {
        $index = [];
        foreach ($rows as $row) {
            // Keep every candidate: duplicate names must never select an arbitrary parent.
            $index[$row['name']][] = ['code' => $row['code'], 'name' => $row['name']];
        }

        return $index;
    }

    private function reference(mixed $value, array $index, string $field): array
    {
        if (is_array($value) && is_string($value['code'] ?? null)) {
            return $value;
        }
        if (! is_string($value) || count($index[$value] ?? []) !== 1) {
            throw new RuntimeException("Unknown or ambiguous PSGC parent: {$field}.");
        }

        return $index[$value][0];
    }

    private function parentId(array $row, string $field, array $map): int
    {
        $code = $row[$field]['code'] ?? null;
        if (! is_string($code) || ! isset($map[$code])) {
            throw new RuntimeException("Unknown PSGC parent: {$field}.");
        }

        return (int) $map[$code];
    }
}
