import { prisma } from "@/lib/prisma";

export async function getTaskActivity(taskId: string) {
  return prisma.activityLog.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
      actor: { select: { id: true, name: true, image: true } },
    },
  });
}

export type TaskActivityEntry = Awaited<ReturnType<typeof getTaskActivity>>[number];
