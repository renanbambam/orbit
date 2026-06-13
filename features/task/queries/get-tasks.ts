import { prisma } from "@/lib/prisma";
import type { TaskPriority, TaskStatus } from "@prisma/client";

type GetTasksOptions = {
  projectId: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  labelId?: string;
  search?: string;
};

export async function getTasksByProject(options: GetTasksOptions) {
  return prisma.task.findMany({
    where: {
      projectId: options.projectId,
      ...(options.status?.length && { status: { in: options.status } }),
      ...(options.priority?.length && { priority: { in: options.priority } }),
      ...(options.assigneeId && { assigneeId: options.assigneeId }),
      ...(options.labelId && { labels: { some: { labelId: options.labelId } } }),
      ...(options.search && {
        title: { contains: options.search, mode: "insensitive" },
      }),
    },
    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      assignee: { select: { id: true, name: true, image: true } },
      labels: { select: { label: { select: { id: true, name: true, color: true } } } },
      _count: { select: { comments: true, attachments: true } },
    },
    orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
  });
}

export type TaskSummary = Awaited<ReturnType<typeof getTasksByProject>>[number];
