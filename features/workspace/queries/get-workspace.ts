import { prisma } from "@/lib/prisma";

export async function getWorkspaceBySlug(slug: string, userId: string) {
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, workspace: { slug } },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          plan: true,
          createdAt: true,
        },
      },
    },
  });

  if (!membership) return null;

  return { ...membership.workspace, role: membership.role };
}

export type CurrentWorkspace = NonNullable<Awaited<ReturnType<typeof getWorkspaceBySlug>>>;
