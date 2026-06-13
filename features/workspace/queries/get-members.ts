import { prisma } from "@/lib/prisma";

export async function getWorkspaceMembers(workspaceId: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    orderBy: { joinedAt: "asc" },
    select: {
      id: true,
      role: true,
      joinedAt: true,
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  const invites = await prisma.workspaceInvite.findMany({
    where: { workspaceId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return { members, invites };
}

export type Member = Awaited<ReturnType<typeof getWorkspaceMembers>>["members"][number];
export type PendingInvite = Awaited<ReturnType<typeof getWorkspaceMembers>>["invites"][number];
