"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, List } from "lucide-react";
import { cn } from "@/lib/utils";

const VIEWS = [
  { key: "board", label: "Board", icon: KanbanSquare },
  { key: "list", label: "List", icon: List },
] as const;

export function ViewSwitcher({
  workspaceSlug,
  projectIdentifier,
}: {
  workspaceSlug: string;
  projectIdentifier: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-lg border p-0.5">
      {VIEWS.map((view) => {
        const href = `/${workspaceSlug}/${projectIdentifier}/${view.key}`;
        const isActive = pathname === href;
        return (
          <Link
            key={view.key}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
              isActive && "bg-muted text-foreground",
            )}
          >
            <view.icon className="size-4" />
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}
