"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  toggleTaskLabelSchema,
  type ToggleTaskLabelInput,
} from "@/features/task/schemas/task.schemas";

export async function toggleTaskLabel(input: ToggleTaskLabelInput) {
  const session = await requireAuth();
  const data = toggleTaskLabelSchema.parse(input);

  const task = await prisma.task.findUnique({
    where: { id: data.taskId },
    select: {
      number: true,
      projectId: true,
      project: {
        select: { identifier: true, workspaceId: true, workspace: { select: { slug: true } } },
      },
    },
  });
  if (!task) {
    return { error: "Task not found" };
  }

  const label = await prisma.label.findUnique({
    where: { id: data.labelId },
    select: { projectId: true },
  });
  if (!label || label.projectId !== task.projectId) {
    return { error: "Label not found in this project" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: task.project.workspaceId, userId: session.user.id },
    },
    select: { role: true },
  });
  if (!membership || membership.role === "VIEWER") {
    return { error: "You do not have permission to edit tasks" };
  }

  const existing = await prisma.taskLabel.findUnique({
    where: { taskId_labelId: { taskId: data.taskId, labelId: data.labelId } },
  });

  if (existing) {
    await prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId: data.taskId, labelId: data.labelId } },
    });
  } else {
    await prisma.taskLabel.create({
      data: { taskId: data.taskId, labelId: data.labelId },
    });
  }

  const base = `/${task.project.workspace.slug}/${task.project.identifier}`;
  revalidatePath(`${base}/${task.number}`);
  revalidatePath(`${base}/board`);
  revalidatePath(`${base}/list`);
  return { active: !existing };
}
