"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  updateMemberRoleSchema,
  type UpdateMemberRoleInput,
} from "@/features/workspace/schemas/workspace.schemas";

export async function updateMemberRole(input: UpdateMemberRoleInput) {
  const session = await requireAuth();
  const data = updateMemberRoleSchema.parse(input);

  const actor = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id },
    },
    select: { role: true, workspace: { select: { slug: true } } },
  });
  if (!actor || (actor.role !== "OWNER" && actor.role !== "ADMIN")) {
    return { error: "You do not have permission to change member roles" };
  }

  const target = await prisma.workspaceMember.findUnique({
    where: { id: data.memberId },
    select: { role: true, workspaceId: true },
  });
  if (!target || target.workspaceId !== data.workspaceId) {
    return { error: "Member not found" };
  }
  if (target.role === "OWNER") {
    return { error: "The workspace owner's role cannot be changed" };
  }

  await prisma.workspaceMember.update({
    where: { id: data.memberId },
    data: { role: data.role },
  });

  revalidatePath(`/${actor.workspace.slug}/settings/members`);
  return { success: true as const };
}
