"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/features/workspace/schemas/workspace.schemas";

const INVITE_TTL_DAYS = 7;

async function sendInviteEmail(to: string, workspaceName: string, token: string) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;
  await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "noreply@orbit.app",
    to,
    subject: `You've been invited to ${workspaceName} on Orbit`,
    html: `<p>You've been invited to join <strong>${workspaceName}</strong> on Orbit.</p><p><a href="${inviteUrl}">Accept the invitation</a></p><p>This link expires in ${INVITE_TTL_DAYS} days.</p>`,
  });
}

export async function inviteMember(input: InviteMemberInput) {
  const session = await requireAuth();
  const data = inviteMemberSchema.parse(input);

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id },
    },
    select: { role: true, workspace: { select: { name: true, slug: true } } },
  });
  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return { error: "You do not have permission to invite members" };
  }

  const existingMember = await prisma.workspaceMember.findFirst({
    where: { workspaceId: data.workspaceId, user: { email: data.email } },
    select: { id: true },
  });
  if (existingMember) {
    return { error: "This person is already a member of the workspace" };
  }

  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const invite = await prisma.$transaction(async (tx) => {
    await tx.workspaceInvite.deleteMany({
      where: { workspaceId: data.workspaceId, email: data.email, acceptedAt: null },
    });
    return tx.workspaceInvite.create({
      data: {
        workspaceId: data.workspaceId,
        email: data.email,
        role: data.role,
        expiresAt,
      },
      select: { token: true },
    });
  });

  await sendInviteEmail(data.email, membership.workspace.name, invite.token);

  revalidatePath(`/${membership.workspace.slug}/settings/members`);
  return { success: true as const };
}
