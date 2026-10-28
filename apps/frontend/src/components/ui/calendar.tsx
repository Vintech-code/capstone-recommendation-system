import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        month_caption: "flex h-8 items-center justify-center px-8",
        caption_label: "text-sm font-bold",
        nav: "flex items-center justify-between gap-1",
        button_previous:
          "absolute left-1 top-1 inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-muted",
        button_next:
          "absolute right-1 top-1 inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-muted",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 rounded-md text-center text-[0.8rem] font-medium text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-lg font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        selected: "bg-primary text-primary-foreground hover:bg-primary",
        range_start: "rounded-l-lg",
        range_end: "rounded-r-lg",
        range_middle: "rounded-none bg-primary/15 text-foreground",
        today: "font-black text-primary-ink",
        outside: "text-muted-foreground/45",
        disabled: "text-muted-foreground/30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          ) : orientation === "right" ? (
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="size-4" aria-hidden="true" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
