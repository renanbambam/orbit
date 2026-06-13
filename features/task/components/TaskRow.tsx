"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { TaskSummary } from "@/features/task/queries/get-tasks";
import { TaskPriorityBadge } from "@/features/task/components/TaskPriorityBadge";
import { TaskStatusSelect } from "@/features/task/components/TaskStatusSelect";
import { UserAvatar } from "@/components/UserAvatar";
import { TableCell, TableRow } from "@/components/ui/table";

export function TaskRow({
  task,
  workspaceSlug,
  projectIdentifier,
  canEdit,
}: {
  task: TaskSummary;
  workspaceSlug: string;
  projectIdentifier: string;
  canEdit: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="text-sm text-muted-foreground">
        {projectIdentifier}-{task.number}
      </TableCell>
      <TableCell className="max-w-md">
        <Link
          href={`/${workspaceSlug}/${projectIdentifier}/${task.number}`}
          className="block truncate font-medium hover:underline"
        >
          {task.title}
        </Link>
      </TableCell>
      <TableCell>
        <TaskStatusSelect taskId={task.id} status={task.status} disabled={!canEdit} />
      </TableCell>
      <TableCell>
        <TaskPriorityBadge priority={task.priority} showLabel />
      </TableCell>
      <TableCell>
        {task.assignee ? (
          <span className="flex items-center gap-2 text-sm">
            <UserAvatar name={task.assignee.name} image={task.assignee.image} className="size-6" />
            <span className="truncate">{task.assignee.name}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {task.dueDate ? formatDate(task.dueDate) : "—"}
      </TableCell>
    </TableRow>
  );
}
