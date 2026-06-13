"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/features/project/schemas/project.schemas";

export async function updateProject(input: UpdateProjectInput) {
  const session = await requireAuth();
  const data = updateProjectSchema.parse(input);

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: {
      identifier: true,
      workspaceId: true,
      workspace: { select: { slug: true } },
    },
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
    return { error: "You do not have permission to update this project" };
  }

  await prisma.project.update({
    where: { id: data.projectId },
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status,
    },
  });

  revalidatePath(`/${project.workspace.slug}/${project.identifier}`);
  revalidatePath(`/${project.workspace.slug}`);
  return { success: true as const };
}
