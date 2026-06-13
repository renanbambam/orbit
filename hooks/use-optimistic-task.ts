"use client";

import { useOptimistic } from "react";
import type { TaskStatus } from "@prisma/client";
import type { TaskSummary } from "@/features/task/queries/get-tasks";

export function useOptimisticTasks(tasks: TaskSummary[]) {
  return useOptimistic(
    tasks,
    (state, update: { taskId: string; status: TaskStatus }) =>
      state.map((task) =>
        task.id === update.taskId ? { ...task, status: update.status } : task,
      ),
  );
}
