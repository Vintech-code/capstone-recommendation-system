<?php

namespace App\Console\Commands;

use App\Services\Locations\PsgcLocationSync;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class SyncLocations extends Command
{
    protected $signature = 'locations:sync {--force : Refresh even within the seven-day sync TTL}';

    protected $description = 'Sync the PSGC Cloud v2 catalogue into the local database';

    public function handle(PsgcLocationSync $sync): int
    {
        $lock = Cache::lock('locations:sync', 3600);
        $acquired = false;
        try {
            $acquired = $lock->get();
            if (! $acquired) {
                $this->error('A location sync is already running. Try again later.');

                return self::FAILURE;
            }
            $latest = DB::table('location_syncs')->latest('id')->first();
            if (! $this->option('force') && $latest && now()->parse($latest->synced_at)->addSeconds(config('locations.sync_ttl'))->isFuture()) {
                $this->info('Local locations are current (seven-day TTL). Use --force to refresh.');

                return self::SUCCESS;
            }
            $counts = $sync->sync();
            foreach ($counts as $resource => $count) {
                $this->info("{$resource}: {$count}");
            }
            $this->info('Location sync succeeded. Local API caches now use the new catalogue version.');

            return self::SUCCESS;
        } catch (Throwable $exception) {
            report($exception);
            $this->error('Location sync failed. The last successful local catalogue is unchanged. Check the Laravel log and retry.');

            return self::FAILURE;
        } finally {
            if ($acquired) {
                $lock->release();
            }
        }
    }
}
