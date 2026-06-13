import { Minus, SignalHigh, SignalLow, SignalMedium, TriangleAlert } from "lucide-react";
import type { TaskPriority } from "@prisma/client";
import { priorityMeta } from "@/features/task/task.constants";
import { cn } from "@/lib/utils";

const PRIORITY_ICONS = {
  URGENT: TriangleAlert,
  HIGH: SignalHigh,
  MEDIUM: SignalMedium,
  LOW: SignalLow,
  NO_PRIORITY: Minus,
} as const;

export function TaskPriorityBadge({
  priority,
  showLabel = false,
}: {
  priority: TaskPriority;
  showLabel?: boolean;
}) {
  const meta = priorityMeta(priority);
  const Icon = PRIORITY_ICONS[priority];

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", meta.textClass)}>
      <Icon className="size-4" />
      {showLabel ? meta.label : null}
    </span>
  );
}
