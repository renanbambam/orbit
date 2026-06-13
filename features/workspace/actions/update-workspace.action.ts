"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  updateWorkspaceSchema,
  type UpdateWorkspaceInput,
} from "@/features/workspace/schemas/workspace.schemas";

export async function updateWorkspace(input: UpdateWorkspaceInput) {
  const session = await requireAuth();
  const data = updateWorkspaceSchema.parse(input);

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id },
    },
    select: { role: true },
  });
  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return { error: "You do not have permission to update this workspace" };
  }

  const workspace = await prisma.workspace.update({
    where: { id: data.workspaceId },
    data: { name: data.name, logoUrl: data.logoUrl ?? undefined },
    select: { slug: true },
  });

  revalidatePath(`/${workspace.slug}/settings`);
  return { success: true as const };
}
