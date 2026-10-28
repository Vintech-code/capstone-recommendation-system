import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLocations,
  type LocationOption,
  type LocationSelection,
} from "../location-api";

const empty: LocationSelection = {
  regionId: null,
  provinceId: null,
  cityMunicipalityId: null,
  barangayId: null,
};

export function LocationFields({
  value,
  onChange,
}: {
  value: LocationSelection | null | undefined;
  onChange: (value: LocationSelection) => void;
}) {
  const selection = value ?? empty;
  const regions = useLocations<LocationOption[]>("regions");
  const provinces = useLocations<{
    items: LocationOption[];
    hasIndependentCities: boolean;
  }>(selection.regionId ? `regions/${selection.regionId}/provinces` : null);
  // A null province is only selected explicitly (city ID present or sentinel -1 in draft).
  const independent =
    selection.provinceId === -1 ||
    (selection.provinceId === null && selection.cityMunicipalityId !== null);
  const cities = useLocations<LocationOption[]>(
    selection.regionId && independent
      ? `regions/${selection.regionId}/independent-cities`
      : selection.provinceId && selection.provinceId > 0
        ? `provinces/${selection.provinceId}/cities-municipalities`
        : null,
  );
  const barangays = useLocations<LocationOption[]>(
    selection.cityMunicipalityId
      ? `cities-municipalities/${selection.cityMunicipalityId}/barangays`
      : null,
  );
  const provinceOptions = [
    ...(provinces.data?.items ?? []),
    ...(provinces.data?.hasIndependentCities
      ? [{ id: -1, code: "", name: "No province (independent city)" }]
      : []),
  ];
  const queries = [regions, provinces, cities, barangays];
  const fields = [
    {
      key: "regionId",
      label: "Region",
      query: regions,
      options: regions.data ?? [],
      enabled: true,
      selected: selection.regionId,
      change: (id: number) => onChange({ ...empty, regionId: id }),
    },
    {
      key: "provinceId",
      label: "Province",
      query: provinces,
      options: provinceOptions,
      enabled: !!selection.regionId,
      selected: independent ? -1 : selection.provinceId,
      change: (id: number) =>
        onChange({
          ...selection,
          provinceId: id,
          cityMunicipalityId: null,
          barangayId: null,
        }),
    },
    {
      key: "cityMunicipalityId",
      label: "City or municipality",
      query: cities,
      options: cities.data ?? [],
      enabled: independent || !!selection.provinceId,
      selected: selection.cityMunicipalityId,
      change: (id: number) =>
        onChange({ ...selection, cityMunicipalityId: id, barangayId: null }),
    },
    {
      key: "barangayId",
      label: "Barangay",
      query: barangays,
      options: barangays.data ?? [],
      enabled: !!selection.cityMunicipalityId,
      selected: selection.barangayId,
      change: (id: number) => onChange({ ...selection, barangayId: id }),
    },
  ];

  return (
    <fieldset className="grid min-w-0 gap-5 sm:col-span-2 sm:grid-cols-2">
      <legend className="sr-only">Philippine location</legend>
      {fields.map((field) => (
        <div key={field.key} className="min-w-0">
          <Label htmlFor={`location-${field.key}`}>
            {field.label}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={field.selected === null ? "" : String(field.selected)}
            onValueChange={(id) => field.change(Number(id))}
            disabled={
              !field.enabled ||
              field.query.isLoading ||
              field.options.length === 0
            }
          >
            <SelectTrigger
              id={`location-${field.key}`}
              aria-required="true"
              className="mt-1.5 h-11 min-h-0 rounded-xs w-full min-w-0 text-xs sm:text-sm"
              aria-describedby={`location-${field.key}-status`}
            >
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent position="popper">
              {field.options.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p
            id={`location-${field.key}-status`}
            className="mt-1 text-sm text-muted-foreground"
            role="status"
          >
            {field.query.isLoading
              ? "Loading choices…"
              : field.enabled &&
                  field.query.isSuccess &&
                  field.options.length === 0
                ? "No choices available."
                : !field.enabled
                  ? "Select the preceding location first."
                  : ""}
          </p>
        </div>
      ))}
      {queries.some((query) => query.isError) ? (
        <div role="alert" className="text-sm sm:col-span-2">
          Location choices could not be loaded. Your selections have been kept.
          <Button
            type="button"
            variant="outline"
            className="ml-2"
            onClick={() => {
              queries
                .filter((query) => query.isError)
                .forEach((query) => {
                  void query.refetch();
                });
            }}
          >
            Retry locations
          </Button>
        </div>
      ) : null}
    </fieldset>
  );
}
