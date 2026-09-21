import type { HTMLAttributes, LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

function FieldLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export { Field, FieldLabel };
