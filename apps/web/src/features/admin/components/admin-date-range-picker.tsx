import { addDays, format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AdminDateRangePickerProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

function toDate(value: string) {
  if (!value) return undefined;
  const date = parseISO(value);
  return isValid(date) ? date : undefined;
}

function toDateValue(date: Date | undefined) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

function AdminDateRangePicker({
  from,
  to,
  onChange,
}: AdminDateRangePickerProps) {
  const selectedRange: DateRange | undefined = from
    ? { from: toDate(from), to: toDate(to) }
    : undefined;
  const [open, setOpen] = useState(false);

  function handleSelect(range: DateRange | undefined) {
    onChange({
      from: toDateValue(range?.from),
      to: toDateValue(range?.to),
    });
    if (range?.from && range?.to) setOpen(false);
  }

  const label = selectedRange?.from
    ? selectedRange.to
      ? `${format(selectedRange.from, "LLL dd, y")} - ${format(selectedRange.to, "LLL dd, y")}`
      : format(selectedRange.from, "LLL dd, y")
    : "Pick a date range";

  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor="admin-date-range">Date range</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="admin-date-range"
            className="h-9 min-w-64 justify-start gap-2 px-2.5 text-left font-normal"
          >
            <CalendarIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={selectedRange?.from ?? addDays(new Date(), -30)}
            selected={selectedRange}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}

export { AdminDateRangePicker };
