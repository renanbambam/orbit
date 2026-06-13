"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import { deleteLabelSchema, type DeleteLabelInput } from "@/features/task/schemas/task.schemas";

export async function deleteLabel(input: DeleteLabelInput) {
  const session = await requireAuth();
  const data = deleteLabelSchema.parse(input);

  const label = await prisma.label.findUnique({
    where: { id: data.labelId },
    select: {
      project: {
        select: { identifier: true, workspaceId: true, workspace: { select: { slug: true } } },
      },
    },
  });
  if (!label) {
    return { error: "Label not found" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: label.project.workspaceId, userId: session.user.id },
    },
    select: { role: true },
  });
  if (!membership || membership.role === "VIEWER") {
    return { error: "You do not have permission to delete labels" };
  }

  await prisma.label.delete({ where: { id: data.labelId } });

  revalidatePath(`/${label.project.workspace.slug}/${label.project.identifier}/settings`);
  return { success: true as const };
}
