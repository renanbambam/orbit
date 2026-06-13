import { prisma } from "@/lib/prisma";

export async function getLabelsByProject(projectId: string) {
  return prisma.label.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });
}

export type LabelOption = Awaited<ReturnType<typeof getLabelsByProject>>[number];
