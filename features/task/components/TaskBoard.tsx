"use client";

import { useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";
import type { TaskSummary } from "@/features/task/queries/get-tasks";
import { updateTaskStatus } from "@/features/task/actions/update-task-status.action";
import { TASK_STATUSES } from "@/features/task/task.constants";
import { TaskColumn } from "@/features/task/components/TaskColumn";
import { useOptimisticTasks } from "@/hooks/use-optimistic-task";

export function TaskBoard({
  tasks,
  workspaceSlug,
  projectIdentifier,
  canEdit,
}: {
  tasks: TaskSummary[];
  workspaceSlug: string;
  projectIdentifier: string;
  canEdit: boolean;
}) {
  const [optimisticTasks, moveTask] = useOptimisticTasks(tasks);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const task = optimisticTasks.find((entry) => entry.id === taskId);
    if (!task) return;

    const overId = String(over.id);
    const isColumn = TASK_STATUSES.some((entry) => entry.value === overId);
    const targetStatus = isColumn
      ? (overId as TaskStatus)
      : optimisticTasks.find((entry) => entry.id === overId)?.status;
    if (!targetStatus || targetStatus === task.status) return;

    startTransition(async () => {
      moveTask({ taskId, status: targetStatus });
      const result = await updateTaskStatus({ taskId, status: targetStatus });
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto p-6">
        {TASK_STATUSES.map((statusEntry) => (
          <TaskColumn
            key={statusEntry.value}
            status={statusEntry.value}
            tasks={optimisticTasks.filter((task) => task.status === statusEntry.value)}
            workspaceSlug={workspaceSlug}
            projectIdentifier={projectIdentifier}
            canEdit={canEdit}
          />
        ))}
      </div>
    </DndContext>
  );
}
