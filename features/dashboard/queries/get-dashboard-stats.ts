import { addDays, format, startOfDay, startOfWeek, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { TASK_STATUSES } from "@/features/task/task.constants";

export async function getDashboardStats(workspaceId: string) {
  const now = new Date();
  const rangeStart = startOfDay(subDays(now, 29));
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const [
    totalTasks,
    doneTasks,
    inProgressTasks,
    overdueTasks,
    recentlyCompleted,
    byStatus,
    completedThisWeek,
    upcomingTasks,
  ] = await Promise.all([
    prisma.task.count({ where: { project: { workspaceId } } }),
    prisma.task.count({ where: { project: { workspaceId }, status: "DONE" } }),
    prisma.task.count({ where: { project: { workspaceId }, status: "IN_PROGRESS" } }),
    prisma.task.count({
      where: {
        project: { workspaceId },
        dueDate: { lt: now },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
    }),
    prisma.task.findMany({
      where: { project: { workspaceId }, completedAt: { gte: rangeStart } },
      select: { completedAt: true },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { project: { workspaceId } },
      _count: { _all: true },
    }),
    prisma.task.findMany({
      where: {
        project: { workspaceId },
        completedAt: { gte: weekStart },
        assigneeId: { not: null },
      },
      select: { assignee: { select: { id: true, name: true } } },
    }),
    prisma.task.findMany({
      where: {
        project: { workspaceId },
        dueDate: { gte: startOfDay(now), lte: addDays(now, 7) },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      orderBy: { dueDate: "asc" },
      take: 8,
      select: {
        id: true,
        number: true,
        title: true,
        dueDate: true,
        priority: true,
        project: { select: { identifier: true } },
        assignee: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  const completionByDay = Array.from({ length: 30 }, (_, index) => {
    const day = addDays(rangeStart, index);
    const key = format(day, "yyyy-MM-dd");
    const completed = recentlyCompleted.filter(
      (task) => task.completedAt && format(task.completedAt, "yyyy-MM-dd") === key,
    ).length;
    return { date: format(day, "MMM d"), completed };
  });

  const statusDistribution = TASK_STATUSES.map((entry) => ({
    status: entry.value,
    label: entry.label,
    count: byStatus.find((row) => row.status === entry.value)?._count._all ?? 0,
  }));

  const velocityMap = new Map<string, { name: string; completed: number }>();
  for (const task of completedThisWeek) {
    if (!task.assignee) continue;
    const existing = velocityMap.get(task.assignee.id);
    if (existing) {
      existing.completed += 1;
    } else {
      velocityMap.set(task.assignee.id, { name: task.assignee.name, completed: 1 });
    }
  }

  return {
    counts: {
      total: totalTasks,
      done: doneTasks,
      inProgress: inProgressTasks,
      overdue: overdueTasks,
    },
    completionByDay,
    statusDistribution,
    velocity: [...velocityMap.values()].sort((a, b) => b.completed - a.completed),
    upcomingTasks,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
