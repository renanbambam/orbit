"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  acceptInviteSchema,
  type AcceptInviteInput,
} from "@/features/workspace/schemas/workspace.schemas";

export async function acceptInvite(input: AcceptInviteInput) {
  const session = await requireAuth();
  const data = acceptInviteSchema.parse(input);

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token: data.token },
    select: {
      id: true,
      workspaceId: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      workspace: { select: { slug: true } },
    },
  });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return { error: "This invitation is no longer valid" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.workspaceMember.upsert({
      where: {
        workspaceId_userId: { workspaceId: invite.workspaceId, userId: session.user.id },
      },
      update: {},
      create: {
        workspaceId: invite.workspaceId,
        userId: session.user.id,
        role: invite.role,
      },
    });
    await tx.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  });

  revalidatePath(`/${invite.workspace.slug}`);
  return { slug: invite.workspace.slug };
}
