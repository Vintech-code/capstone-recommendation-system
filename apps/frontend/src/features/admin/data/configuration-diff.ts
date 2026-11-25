const EDITABLE_PROGRAMME_FIELDS = [
  "cover_image_url",
  "logo_image_url",
] as const;

function programmeChangeScope(
  baseline: Record<string, unknown>,
  payload: Record<string, unknown>,
  selectedId?: string,
) {
  const baselineProgrammes =
    (baseline.programmes as Array<Record<string, unknown>> | undefined) ?? [];
  const currentProgrammes =
    (payload.programmes as Array<Record<string, unknown>> | undefined) ?? [];
  const baselineById = new Map(
    baselineProgrammes.map((programme) => [String(programme.id), programme]),
  );
  const fieldCounts = new Map<string, number>();

  currentProgrammes.forEach((programme) => {
    const id = String(programme.id);
    const original = baselineById.get(id) ?? {};
    const count = EDITABLE_PROGRAMME_FIELDS.filter(
      (field) =>
        JSON.stringify(original[field]) !== JSON.stringify(programme[field]),
    ).length;
    if (count > 0) fieldCounts.set(id, count);
  });

  return {
    changedProgrammeCount: fieldCounts.size,
    selectedFieldCount: selectedId ? (fieldCounts.get(selectedId) ?? 0) : 0,
  };
}

export { EDITABLE_PROGRAMME_FIELDS, programmeChangeScope };
