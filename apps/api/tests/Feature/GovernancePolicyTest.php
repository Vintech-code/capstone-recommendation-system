<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\RoleSlug;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\Privacy\StudentRetentionService;
use App\Services\Reliability\EncryptedDatabaseBackup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

final class GovernancePolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_student_identity_and_free_text_are_anonymized_while_records_remain_countable(): void
    {
        $role = Role::query()->create(['slug' => RoleSlug::Student->value, 'name' => RoleSlug::Student->name]);
        $student = User::factory()->create(['name' => 'Student Name', 'email' => 'student@example.test']);
        $student->roles()->attach($role);
        StudentProfile::query()->create(['user_id' => $student->getKey(), 'strengths' => ['Problem solving'], 'growth_areas' => ['Speaking'], 'learning_preferences' => ['Visual']]);
        $student->forceFill(['created_at' => now()->subYears(6), 'updated_at' => now()->subYears(6)])->saveQuietly();
        StudentProfile::query()->where('user_id', $student->getKey())->update(['created_at' => now()->subYears(6), 'updated_at' => now()->subYears(6)]);

        $service = app(StudentRetentionService::class);
        $this->assertSame($student->getKey(), $service->candidates()[0]['studentId']);
        $service->anonymize($student->fresh());

        $student->refresh();
        $this->assertSame('Archived Student '.$student->getKey(), $student->name);
        $this->assertSame('archived-student-'.$student->getKey().'@invalid.local', $student->email);
        $this->assertSame('suspended', $student->account_status);
        $this->assertNotNull($student->privacy_anonymized_at);
        $this->assertSame([], $student->studentProfile->strengths);
        $this->assertCount(1, User::query()->whereNotNull('privacy_anonymized_at')->get());
    }

    public function test_sqlite_backup_is_encrypted_and_restores_to_an_integrity_checked_temporary_database(): void
    {
        $database = tempnam(sys_get_temp_dir(), 'pathways-source-');
        $pdo = new \PDO('sqlite:'.$database);
        $pdo->exec('CREATE TABLE verification (id INTEGER PRIMARY KEY, value TEXT)');
        $pdo->exec("INSERT INTO verification (value) VALUES ('Student Name')");
        Storage::fake('local');
        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', $database);
        config()->set('pathways.backup.disk', 'local');
        config()->set('pathways.backup.directory', 'backups');
        config()->set('pathways.backup.encryption_key', base64_encode(random_bytes(32)));

        $service = app(EncryptedDatabaseBackup::class);
        $path = $service->create();
        Storage::disk('local')->assertExists($path);
        $this->assertStringNotContainsString('Student Name', Storage::disk('local')->get($path));
        $this->assertSame($path, $service->verifyLatest());
        @unlink($database);
    }

    public function test_identifiable_export_policy_is_disabled(): void
    {
        $this->assertFalse(config('pathways.identifiable_exports_enabled'));
    }
}
