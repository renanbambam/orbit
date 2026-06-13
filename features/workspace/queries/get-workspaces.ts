import { prisma } from "@/lib/prisma";

export async function getUserWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    orderBy: { joinedAt: "asc" },
    select: {
      role: true,
      workspace: {
        select: { id: true, name: true, slug: true, logoUrl: true, plan: true },
      },
    },
  });

  return memberships.map((membership) => ({
    ...membership.workspace,
    role: membership.role,
  }));
}

export type WorkspaceSummary = Awaited<ReturnType<typeof getUserWorkspaces>>[number];
