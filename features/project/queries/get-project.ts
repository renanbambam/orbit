import { prisma } from "@/lib/prisma";

export async function getProjectByIdentifier(identifier: string, workspaceId: string) {
  return prisma.project.findUnique({
    where: { workspaceId_identifier: { workspaceId, identifier } },
    select: {
      id: true,
      workspaceId: true,
      name: true,
      description: true,
      identifier: true,
      color: true,
      status: true,
      createdAt: true,
    },
  });
}

export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectByIdentifier>>>;
