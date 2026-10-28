import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAdminTheme } from "@/features/admin/theme/admin-theme-context";

export function AdminThemeToggle() {
  const { resolvedTheme, toggleTheme } = useAdminTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={toggleTheme}
          className="size-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isDark ? (
            <Sun className="size-4.5 text-amber-400 transition-transform hover:rotate-45" aria-hidden="true" />
          ) : (
            <Moon className="size-4.5 transition-transform hover:-rotate-12" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <span>{label}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export function AdminThemeDropdownItem() {
  const { resolvedTheme, toggleTheme } = useAdminTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        toggleTheme();
      }}
      className="cursor-pointer gap-2"
    >
      {isDark ? (
        <>
          <Sun className="size-4 text-amber-400" aria-hidden="true" />
          <span>Light mode</span>
        </>
      ) : (
        <>
          <Moon className="size-4" aria-hidden="true" />
          <span>Dark mode</span>
        </>
      )}
    </DropdownMenuItem>
  );
}

