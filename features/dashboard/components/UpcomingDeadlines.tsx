import Link from "next/link";
import { format } from "date-fns";
import type { DashboardStats } from "@/features/dashboard/queries/get-dashboard-stats";
import { TaskPriorityBadge } from "@/features/task/components/TaskPriorityBadge";
import { UserAvatar } from "@/components/UserAvatar";

export function UpcomingDeadlines({
  tasks,
  workspaceSlug,
}: {
  tasks: DashboardStats["upcomingTasks"];
  workspaceSlug: string;
}) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing due in the next 7 days.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
          <TaskPriorityBadge priority={task.priority} />
          <Link
            href={`/${workspaceSlug}/${task.project.identifier}/${task.number}`}
            className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
          >
            <span className="mr-2 text-muted-foreground">
              {task.project.identifier}-{task.number}
            </span>
            {task.title}
          </Link>
          {task.assignee ? (
            <UserAvatar name={task.assignee.name} image={task.assignee.image} className="size-5" />
          ) : null}
          <span className="shrink-0 text-xs text-muted-foreground">
            {task.dueDate ? format(task.dueDate, "MMM d") : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
