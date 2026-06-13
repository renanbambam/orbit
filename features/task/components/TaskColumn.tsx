"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { TaskStatus } from "@prisma/client";
import type { TaskSummary } from "@/features/task/queries/get-tasks";
import { statusMeta } from "@/features/task/task.constants";
import { TaskCard } from "@/features/task/components/TaskCard";
import { cn } from "@/lib/utils";

export function TaskColumn({
  status,
  tasks,
  workspaceSlug,
  projectIdentifier,
  canEdit,
}: {
  status: TaskStatus;
  tasks: TaskSummary[];
  workspaceSlug: string;
  projectIdentifier: string;
  canEdit: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = statusMeta(status);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn("size-2 rounded-full", meta.dotClass)} />
        <h2 className="text-sm font-medium">{meta.label}</h2>
        <span className="text-sm text-muted-foreground">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-2 rounded-lg bg-muted/50 p-2 transition-colors",
          isOver && "bg-muted ring-2 ring-ring/40",
        )}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              workspaceSlug={workspaceSlug}
              projectIdentifier={projectIdentifier}
              canDrag={canEdit}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
