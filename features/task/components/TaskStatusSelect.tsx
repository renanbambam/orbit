"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";
import { updateTaskStatus } from "@/features/task/actions/update-task-status.action";
import { TASK_STATUSES } from "@/features/task/task.constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function TaskStatusSelect({
  taskId,
  status,
  disabled = false,
  className,
}: {
  taskId: string;
  status: TaskStatus;
  disabled?: boolean;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    startTransition(async () => {
      const result = await updateTaskStatus({ taskId, status: next as TaskStatus });
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={disabled || isPending}>
      <SelectTrigger className={cn("h-8 w-40", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUSES.map((entry) => (
          <SelectItem key={entry.value} value={entry.value}>
            <span className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", entry.dotClass)} />
              {entry.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
