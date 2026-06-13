"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  archiveProjectSchema,
  type ArchiveProjectInput,
} from "@/features/project/schemas/project.schemas";

export async function archiveProject(input: ArchiveProjectInput) {
  const session = await requireAuth();
  const data = archiveProjectSchema.parse(input);

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: { workspaceId: true, workspace: { select: { slug: true } } },
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
  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return { error: "You do not have permission to archive this project" };
  }

  await prisma.project.update({
    where: { id: data.projectId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath(`/${project.workspace.slug}`);
  return { slug: project.workspace.slug };
}
