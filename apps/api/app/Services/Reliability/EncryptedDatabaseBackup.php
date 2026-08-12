<?php

namespace App\Services\Reliability;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PDO;
use RuntimeException;

final class EncryptedDatabaseBackup
{
    public function create(): string
    {
        [$plain, $driver] = $this->dump();
        $iv = random_bytes(12);
        $tag = '';
        $ciphertext = openssl_encrypt($plain, 'aes-256-gcm', $this->key(), OPENSSL_RAW_DATA, $iv, $tag);
        if ($ciphertext === false) {
            throw new RuntimeException('The database backup could not be encrypted.');
        }

        $payload = json_encode([
            'version' => 1,
            'driver' => $driver,
            'createdAt' => now()->toAtomString(),
            'cipher' => 'aes-256-gcm',
            'iv' => base64_encode($iv),
            'tag' => base64_encode($tag),
            'sha256' => hash('sha256', $plain),
            'ciphertext' => base64_encode($ciphertext),
        ], JSON_THROW_ON_ERROR);
        $path = trim((string) config('pathways.backup.directory', 'backups'), '/').'/pathways-'.now()->format('Ymd-His').'.'.$driver.'.enc.json';
        Storage::disk((string) config('pathways.backup.disk', 'local'))->put($path, $payload);

        return $path;
    }

    public function verifyLatest(): string
    {
        $disk = Storage::disk((string) config('pathways.backup.disk', 'local'));
        $directory = trim((string) config('pathways.backup.directory', 'backups'), '/');
        $path = collect($disk->files($directory))->filter(fn (string $file): bool => str_ends_with($file, '.enc.json'))->sortDesc()->first();
        if (! is_string($path)) {
            throw new RuntimeException('No encrypted database backup is available to verify.');
        }

        $payload = json_decode((string) $disk->get($path), true, flags: JSON_THROW_ON_ERROR);
        $plain = openssl_decrypt(base64_decode($payload['ciphertext'], true), 'aes-256-gcm', $this->key(), OPENSSL_RAW_DATA, base64_decode($payload['iv'], true), base64_decode($payload['tag'], true));
        if ($plain === false || ! hash_equals((string) $payload['sha256'], hash('sha256', $plain))) {
            throw new RuntimeException('Backup decryption or checksum verification failed.');
        }

        match ($payload['driver'] ?? null) {
            'sqlite' => $this->verifySqlite($plain),
            'mysql' => $this->verifyMysql($plain),
            default => throw new RuntimeException('The encrypted backup uses an unsupported database driver.'),
        };

        return $path;
    }

    /** @return array{string, string} */
    private function dump(): array
    {
        return match (config('database.default')) {
            'sqlite' => [$this->readSqlite(), 'sqlite'],
            'mysql' => [$this->dumpMysql(), 'mysql'],
            default => throw new RuntimeException('Configure and test a driver-specific encrypted backup before using this database driver.'),
        };
    }

    private function readSqlite(): string
    {
        $path = (string) config('database.connections.sqlite.database');
        $contents = is_file($path) ? file_get_contents($path) : false;
        if ($contents === false) {
            throw new RuntimeException('The configured SQLite database file could not be read.');
        }

        return $contents;
    }

    private function dumpMysql(): string
    {
        $pdo = DB::connection('mysql')->getPdo();
        $tables = [];
        foreach ($pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(PDO::FETCH_NUM) as $tableRow) {
            $name = (string) $tableRow[0];
            $quoted = '`'.str_replace('`', '``', $name).'`';
            $create = $pdo->query('SHOW CREATE TABLE '.$quoted)->fetch(PDO::FETCH_ASSOC);
            $rows = $pdo->query('SELECT * FROM '.$quoted)->fetchAll(PDO::FETCH_ASSOC);
            $tables[] = ['name' => $name, 'create' => array_values($create)[1], 'rows' => $rows];
        }

        return json_encode(['format' => 'pathways-mysql-logical-v1', 'tables' => $tables], JSON_THROW_ON_ERROR);
    }

    private function verifySqlite(string $plain): void
    {
        $temporary = tempnam(sys_get_temp_dir(), 'pathways-restore-');
        if ($temporary === false) {
            throw new RuntimeException('A temporary restore-check file could not be created.');
        }
        try {
            file_put_contents($temporary, $plain, LOCK_EX);
            $integrity = (new PDO('sqlite:'.$temporary))->query('PRAGMA integrity_check')->fetchColumn();
            if ($integrity !== 'ok') {
                throw new RuntimeException('The restored SQLite backup failed its integrity check.');
            }
        } finally {
            @unlink($temporary);
        }
    }

    private function verifyMysql(string $plain): void
    {
        $connection = config('database.connections.mysql');
        $database = 'pathways_restore_check_'.strtolower(bin2hex(random_bytes(6)));
        $identifier = '`'.str_replace('`', '``', $database).'`';
        $server = new PDO('mysql:host='.$connection['host'].';port='.$connection['port'].';charset=utf8mb4', $connection['username'], $connection['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $archive = json_decode($plain, true, flags: JSON_THROW_ON_ERROR);
        if (($archive['format'] ?? null) !== 'pathways-mysql-logical-v1' || ! is_array($archive['tables'] ?? null)) {
            throw new RuntimeException('The MySQL logical backup format is invalid.');
        }
        $server->exec('CREATE DATABASE '.$identifier.' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        try {
            $restored = new PDO('mysql:host='.$connection['host'].';port='.$connection['port'].';dbname='.$database.';charset=utf8mb4', $connection['username'], $connection['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            $restored->exec('SET FOREIGN_KEY_CHECKS=0');
            foreach ($archive['tables'] as $table) {
                $restored->exec((string) $table['create']);
            }
            foreach ($archive['tables'] as $table) {
                foreach ($table['rows'] as $row) {
                    if ($row === []) {
                        continue;
                    }
                    $columns = array_keys($row);
                    $statement = $restored->prepare('INSERT INTO `'.str_replace('`', '``', $table['name']).'` (`'.implode('`, `', array_map(static fn (string $column): string => str_replace('`', '``', $column), $columns)).'`) VALUES ('.implode(', ', array_fill(0, count($columns), '?')).')');
                    $statement->execute(array_values($row));
                }
            }
            $restored->exec('SET FOREIGN_KEY_CHECKS=1');
            $tableCount = (int) $restored->query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()')->fetchColumn();
            if ($tableCount !== count($archive['tables'])) {
                throw new RuntimeException('The restored MySQL backup did not contain any tables.');
            }
        } finally {
            $server->exec('DROP DATABASE IF EXISTS '.$identifier);
        }
    }

    private function key(): string
    {
        $encoded = (string) config('pathways.backup.encryption_key');
        if ($encoded === '') {
            throw new RuntimeException('Configure PATHWAYS_BACKUP_KEY or APP_KEY before running encrypted backups.');
        }
        $material = str_starts_with($encoded, 'base64:') ? base64_decode(substr($encoded, 7), true) : base64_decode($encoded, true);
        if ($material === false) {
            $material = $encoded;
        }

        return hash_hkdf('sha256', $material, 32, 'pathways-database-backup-v1');
    }
}
