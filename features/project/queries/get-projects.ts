import { prisma } from "@/lib/prisma";

export async function getProjectsByWorkspace(workspaceId: string) {
  return prisma.project.findMany({
    where: { workspaceId, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      identifier: true,
      color: true,
      status: true,
      _count: { select: { tasks: true } },
    },
  });
}

export type ProjectSummary = Awaited<ReturnType<typeof getProjectsByWorkspace>>[number];
