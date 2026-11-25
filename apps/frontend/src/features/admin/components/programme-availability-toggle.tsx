import { Lock, LockOpen } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { updateProgrammeAvailability } from "@/features/admin/data/admin-api";

interface ProgrammeAvailabilityToggleProps {
  programmeId: string;
  isOpen: boolean;
  onUpdated: () => void;
}

export function ProgrammeAvailabilityToggle({
  programmeId,
  isOpen,
  onUpdated,
}: ProgrammeAvailabilityToggleProps) {
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    try {
      await updateProgrammeAvailability(programmeId, !isOpen);
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={saving}
      onClick={toggle}
      className={
        isOpen
          ? "h-8 rounded-xs border-border px-2.5 text-xs font-semibold text-foreground hover:bg-warning/15 hover:text-warning-ink"
          : "h-8 rounded-xs border-warning/40 bg-warning/15 px-2.5 text-xs font-bold text-warning-ink hover:bg-primary/15 hover:text-primary-ink"
      }
      title={isOpen ? "Mark programme as full / closed" : "Reopen programme for enrollment"}
    >
      {isOpen ? (
        <>
          <LockOpen aria-hidden="true" className="size-3.5" />
          Mark Full
        </>
      ) : (
        <>
          <Lock aria-hidden="true" className="size-3.5" />
          Slots Full · Reopen
        </>
      )}
    </Button>
  );
}
