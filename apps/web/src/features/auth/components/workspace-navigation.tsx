import { LayoutDashboard } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DashboardModule } from "@/features/auth/workspace-definitions";
import { cn } from "@/lib/utils";

interface WorkspaceNavigationProps {
  modules: DashboardModule[];
  activeId: string;
  onSelect: (id: string) => void;
  collapsed?: boolean;
  tone?: "default" | "staff";
}

interface NavSection {
  title?: string;
  items: Array<{
    id: string;
    title: string;
    icon: DashboardModule["icon"];
  }>;
}

function WorkspaceNavigation({
  modules,
  activeId,
  onSelect,
  collapsed = false,
  tone = "default",
}: WorkspaceNavigationProps) {
  const allItems = [
    { id: "overview", title: "Dashboard", icon: LayoutDashboard },
    ...modules,
  ];

  let sections: NavSection[];

  if (tone === "staff") {
    const mainIds = ["overview", "students", "programmes"];
    const mainItems = allItems.filter((item) => mainIds.includes(item.id));
    const governanceIds = ["reports", "activity", "administrators"];
    const governanceItems = allItems.filter((item) =>
      governanceIds.includes(item.id),
    );
    const accountItems = allItems.filter(
      (item) => !mainIds.includes(item.id) && !governanceIds.includes(item.id),
    );

    sections = [
      { title: "General", items: mainItems },
      ...(governanceItems.length > 0
        ? [{ title: "Governance", items: governanceItems }]
        : []),
      ...(accountItems.length > 0
        ? [{ title: "Account", items: accountItems }]
        : []),
    ];
  } else {
    sections = [{ items: allItems }];
  }

  return (
    <nav aria-label="Workspace navigation">
      <div className="space-y-4">
        {sections.map((section, sIdx) => (
          <div key={section.title ?? sIdx} className="space-y-1">
            {section.title && !collapsed ? (
              <p
                className={cn(
                  "pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider",
                  tone === "staff"
                    ? "px-4 text-emerald-100/60"
                    : "px-3 text-muted-foreground/70",
                )}
              >
                {section.title}
              </p>
            ) : section.title && collapsed && sIdx > 0 ? (
              <div
                className={cn(
                  "my-2 border-t",
                  tone === "staff" ? "border-white/10" : "border-border/60",
                )}
                aria-hidden="true"
              />
            ) : null}

            <ul className={tone === "staff" ? "space-y-0.5" : "space-y-1"}>
              {section.items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onSelect(item.id)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "group flex min-h-10 w-full items-center gap-3 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                            tone === "staff"
                              ? cn(
                                  "rounded-none px-4",
                                  collapsed && "justify-center px-0",
                                  isActive
                                    ? "bg-white/15 font-bold text-white shadow-2xs"
                                    : "text-white/70 hover:bg-white/10 hover:text-white",
                                )
                              : cn(
                                  "rounded-lg px-3",
                                  collapsed && "justify-center px-0",
                                  isActive
                                    ? "bg-muted font-bold text-foreground shadow-2xs"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                ),
                          )}
                        >
                          <item.icon
                            className={cn(
                              "size-4 shrink-0 transition-colors",
                              tone === "staff"
                                ? isActive
                                  ? "text-primary"
                                  : "text-white/60 group-hover:text-white"
                                : isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          <span
                            className={cn(collapsed && "sr-only", "truncate")}
                          >
                            {item.title}
                          </span>
                        </button>
                      </TooltipTrigger>
                      {collapsed ? (
                        <TooltipContent side="right" sideOffset={12}>
                          {item.title}
                        </TooltipContent>
                      ) : null}
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export { WorkspaceNavigation };
