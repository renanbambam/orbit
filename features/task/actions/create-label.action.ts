"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import { createLabelSchema, type CreateLabelInput } from "@/features/task/schemas/task.schemas";

export async function createLabel(input: CreateLabelInput) {
  const session = await requireAuth();
  const data = createLabelSchema.parse(input);

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: { identifier: true, workspaceId: true, workspace: { select: { slug: true } } },
  });
  if (!project) {
    return { error: "Project not found" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: project.workspaceId, userId: session.user.id },
    },
    select: { role: true },
  });
  if (!membership || membership.role === "VIEWER") {
    return { error: "You do not have permission to create labels" };
  }

  const label = await prisma.label.create({
    data: { projectId: data.projectId, name: data.name, color: data.color },
    select: { id: true },
  });

  revalidatePath(`/${project.workspace.slug}/${project.identifier}/settings`);
  return { id: label.id };
}
