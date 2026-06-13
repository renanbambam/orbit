"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { CalendarDays, MessageSquare, Paperclip } from "lucide-react";
import type { TaskSummary } from "@/features/task/queries/get-tasks";
import { TaskPriorityBadge } from "@/features/task/components/TaskPriorityBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  workspaceSlug,
  projectIdentifier,
  canDrag,
}: {
  task: TaskSummary;
  workspaceSlug: string;
  projectIdentifier: string;
  canDrag: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
    disabled: !canDrag,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm",
        canDrag && "cursor-grab active:cursor-grabbing",
        isDragging && "z-10 opacity-70 ring-2 ring-ring",
      )}
      {...attributes}
      {...listeners}
    >
      <p className="text-xs font-medium text-muted-foreground">
        {projectIdentifier}-{task.number}
      </p>
      <Link
        href={`/${workspaceSlug}/${projectIdentifier}/${task.number}`}
        className="mt-1 block text-sm font-medium leading-snug hover:underline"
      >
        {task.title}
      </Link>
      {task.labels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map(({ label }) => (
            <span
              key={label.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <TaskPriorityBadge priority={task.priority} />
        {task.dueDate ? (
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {format(task.dueDate, "MMM d")}
          </span>
        ) : null}
        {task._count.comments > 0 ? (
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {task._count.comments}
          </span>
        ) : null}
        {task._count.attachments > 0 ? (
          <span className="flex items-center gap-1">
            <Paperclip className="size-3.5" />
            {task._count.attachments}
          </span>
        ) : null}
        {task.assignee ? (
          <span className="ml-auto">
            <UserAvatar name={task.assignee.name} image={task.assignee.image} className="size-5" />
          </span>
        ) : null}
      </div>
    </div>
  );
}
