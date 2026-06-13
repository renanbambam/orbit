import { prisma } from "@/lib/prisma";

export async function getTaskOptions(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { number: "asc" },
    select: { id: true, number: true, title: true },
  });
}

export type TaskOption = Awaited<ReturnType<typeof getTaskOptions>>[number];
