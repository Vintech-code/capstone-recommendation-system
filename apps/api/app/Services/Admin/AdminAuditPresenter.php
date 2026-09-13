<?php

namespace App\Services\Admin;

use App\Models\AdminAuditEvent;

final class AdminAuditPresenter
{
    /** @param array<string, mixed>|null $metadata
     * @return array<string, mixed>
     */
    public function safeMetadata(?array $metadata): array
    {
        if ($metadata === null) {
            return [];
        }

        $allowed = ['kind', 'version', 'status', 'sourceVersion', 'sourceName', 'lastVerifiedAt', 'format', 'dataClassification', 'from', 'to', 'beforeStatus', 'afterStatus', 'changedSections', 'changedProgrammeCount'];

        return collect($metadata)
            ->only($allowed)
            ->filter(static fn (mixed $value): bool => is_null($value) || is_scalar($value) || (is_array($value) && collect($value)->every(fn (mixed $item): bool => is_scalar($item))))
            ->all();
    }

    public function summary(AdminAuditEvent $event): string
    {
        $metadata = $this->safeMetadata($event->metadata);
        $parts = [];
        if (isset($metadata['kind'], $metadata['version'])) {
            $parts[] = ucfirst((string) $metadata['kind']).' version '.$metadata['version'];
        }
        if (isset($metadata['status'])) {
            $parts[] = 'status '.str_replace('_', ' ', (string) $metadata['status']);
        }
        if (isset($metadata['sourceVersion'])) {
            $parts[] = 'restored from version '.$metadata['sourceVersion'];
        }
        if (isset($metadata['sourceName'])) {
            $parts[] = (string) $metadata['sourceName'];
        }
        if (isset($metadata['beforeStatus'], $metadata['afterStatus'])) {
            $parts[] = $metadata['beforeStatus'].' to '.$metadata['afterStatus'];
        }
        if (isset($metadata['changedProgrammeCount'])) {
            $parts[] = $metadata['changedProgrammeCount'].' programme records changed';
        }

        return $parts !== [] ? implode(' · ', $parts) : str_replace(['.', '_'], ' ', $event->action);
    }
}
