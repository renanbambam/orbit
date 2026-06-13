import type { TaskPriority, TaskStatus } from "@prisma/client";

export const TASK_STATUSES: { value: TaskStatus; label: string; dotClass: string }[] = [
  { value: "BACKLOG", label: "Backlog", dotClass: "bg-gray-400" },
  { value: "TODO", label: "Todo", dotClass: "bg-blue-500" },
  { value: "IN_PROGRESS", label: "In Progress", dotClass: "bg-purple-500" },
  { value: "IN_REVIEW", label: "In Review", dotClass: "bg-amber-500" },
  { value: "DONE", label: "Done", dotClass: "bg-green-500" },
  { value: "CANCELLED", label: "Cancelled", dotClass: "bg-red-400/60" },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; textClass: string }[] = [
  { value: "URGENT", label: "Urgent", textClass: "text-red-500" },
  { value: "HIGH", label: "High", textClass: "text-orange-500" },
  { value: "MEDIUM", label: "Medium", textClass: "text-yellow-500" },
  { value: "LOW", label: "Low", textClass: "text-gray-500" },
  { value: "NO_PRIORITY", label: "No priority", textClass: "text-muted-foreground" },
];

export function statusMeta(status: TaskStatus) {
  return TASK_STATUSES.find((entry) => entry.value === status) ?? TASK_STATUSES[0];
}

export function priorityMeta(priority: TaskPriority) {
  return TASK_PRIORITIES.find((entry) => entry.value === priority) ?? TASK_PRIORITIES[4];
}
