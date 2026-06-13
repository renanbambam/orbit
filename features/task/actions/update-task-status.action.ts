"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  updateTaskStatusSchema,
  type UpdateTaskStatusInput,
} from "@/features/task/schemas/task.schemas";

export async function updateTaskStatus(input: UpdateTaskStatusInput) {
  const session = await requireAuth();
  const data = updateTaskStatusSchema.parse(input);

  const task = await prisma.task.findUnique({
    where: { id: data.taskId },
    select: {
      number: true,
      status: true,
      project: {
        select: { identifier: true, workspaceId: true, workspace: { select: { slug: true } } },
      },
    },
  });
  if (!task) {
    return { error: "Task not found" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: task.project.workspaceId, userId: session.user.id },
    },
    select: { role: true },
  });
  if (!membership || membership.role === "VIEWER") {
    return { error: "You do not have permission to update tasks" };
  }

  if (task.status === data.status) {
    return { success: true as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: data.taskId },
      data: {
        status: data.status,
        completedAt: data.status === "DONE" ? new Date() : null,
      },
    });
    await tx.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        taskId: data.taskId,
        actorId: session.user.id,
        action: "task.status_changed",
        metadata: {
          number: task.number,
          identifier: task.project.identifier,
          from: task.status,
          to: data.status,
        },
      },
    });
  });

  const base = `/${task.project.workspace.slug}/${task.project.identifier}`;
  revalidatePath(`${base}/board`);
  revalidatePath(`${base}/list`);
  revalidatePath(`${base}/${task.number}`);
  revalidatePath(`/${task.project.workspace.slug}`);
  return { success: true as const };
}
