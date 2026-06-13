import { formatDistanceToNow } from "date-fns";
import type { TaskStatus } from "@prisma/client";
import type { ActivityEntry } from "@/features/dashboard/queries/get-activity-feed";
import { statusMeta } from "@/features/task/task.constants";
import { UserAvatar } from "@/components/UserAvatar";

type ActivityMetadata = {
  identifier?: string;
  number?: number;
  title?: string;
  from?: string;
  to?: string;
};

function statusLabel(value: string | undefined) {
  if (!value) return "unknown";
  return statusMeta(value as TaskStatus).label;
}

function describe(entry: ActivityEntry) {
  const meta = (entry.metadata ?? {}) as ActivityMetadata;
  const ref =
    meta.identifier && meta.number ? `${meta.identifier}-${meta.number}` : "a task";

  switch (entry.action) {
    case "task.created":
      return `created ${ref}`;
    case "task.status_changed":
      return `moved ${ref} from ${statusLabel(meta.from)} to ${statusLabel(meta.to)}`;
    case "task.updated":
      return `updated ${ref}`;
    case "task.assigned":
      return `reassigned ${ref}`;
    case "task.deleted":
      return `deleted ${ref}`;
    case "comment.added":
      return `commented on ${ref}`;
    default:
      return entry.action;
  }
}

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3">
          <UserAvatar name={entry.actor.name} image={entry.actor.image} className="size-6" />
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-medium">{entry.actor.name}</span>{" "}
            <span className="text-muted-foreground">{describe(entry)}</span>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(entry.createdAt, { addSuffix: true })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
