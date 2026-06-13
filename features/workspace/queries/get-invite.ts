import { prisma } from "@/lib/prisma";

export async function getInvite(token: string) {
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    select: {
      email: true,
      expiresAt: true,
      acceptedAt: true,
      workspace: { select: { name: true } },
    },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return null;
  }

  return { email: invite.email, workspaceName: invite.workspace.name };
}
