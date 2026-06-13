"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  removeDependencySchema,
  type RemoveDependencyInput,
} from "@/features/task/schemas/task.schemas";

export async function removeDependency(input: RemoveDependencyInput) {
  const session = await requireAuth();
  const data = removeDependencySchema.parse(input);

  const dependency = await prisma.taskDependency.findUnique({
    where: { id: data.dependencyId },
    select: {
      blocked: {
        select: {
          number: true,
          project: {
            select: { identifier: true, workspaceId: true, workspace: { select: { slug: true } } },
          },
        },
      },
    },
  });
  if (!dependency) {
    return { error: "Dependency not found" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: dependency.blocked.project.workspaceId,
        userId: session.user.id,
      },
    },
    select: { role: true },
  });
  if (!membership || membership.role === "VIEWER") {
    return { error: "You do not have permission to edit tasks" };
  }

  await prisma.taskDependency.delete({ where: { id: data.dependencyId } });

  const project = dependency.blocked.project;
  revalidatePath(`/${project.workspace.slug}/${project.identifier}/${dependency.blocked.number}`);
  return { success: true as const };
}
