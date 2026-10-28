import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FloatingInputFieldProps extends Omit<ComponentProps<"input">, "id"> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  endAdornment?: ReactNode;
}

function FloatingInputField({
  id,
  label,
  icon: Icon,
  error,
  endAdornment,
  className,
  ...inputProps
}: FloatingInputFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "peer h-10.5 rounded-xs pl-8.5 pr-3 pt-2 text-xs sm:text-sm focus:border-primary focus:ring-1 focus:ring-primary",
            endAdornment ? "pr-9" : "",
            className,
          )}
          {...inputProps}
        />
        <Label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-8.5 top-1/2 z-20 -translate-y-1/2 bg-transparent px-1 text-xs font-normal text-muted-foreground transition-all duration-150",
            "peer-focus:left-2 peer-focus:top-0 peer-focus:bg-card/95 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:text-primary-ink",
            "peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:bg-card/95 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold",
          )}
        >
          {label}
        </Label>
        {endAdornment}
      </div>
      {error ? (
        <p
          id={errorId}
          className="text-[11px] font-semibold text-destructive-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FloatingInputField };
