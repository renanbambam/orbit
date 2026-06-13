import { prisma } from "@/lib/prisma";

export async function getActivityFeed(workspaceId: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
      actor: { select: { id: true, name: true, image: true } },
      task: { select: { number: true, project: { select: { identifier: true } } } },
    },
  });
}

export type ActivityEntry = Awaited<ReturnType<typeof getActivityFeed>>[number];
