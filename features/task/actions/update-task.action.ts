"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import { createNotification } from "@/features/notification/notification.helpers";
import { updateTaskSchema, type UpdateTaskInput } from "@/features/task/schemas/task.schemas";

export async function updateTask(input: UpdateTaskInput) {
  const session = await requireAuth();
  const data = updateTaskSchema.parse(input);

  const task = await prisma.task.findUnique({
    where: { id: data.taskId },
    select: {
      number: true,
      title: true,
      assigneeId: true,
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

  const assigneeChanged =
    data.assigneeId !== undefined && data.assigneeId !== task.assigneeId;
  const notifyUserId =
    assigneeChanged && data.assigneeId && data.assigneeId !== session.user.id
      ? data.assigneeId
      : null;
  const ref = `${task.project.identifier}-${task.number}`;

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: data.taskId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
      },
    });
    await tx.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        taskId: data.taskId,
        actorId: session.user.id,
        action: assigneeChanged ? "task.assigned" : "task.updated",
        metadata: { number: task.number, identifier: task.project.identifier },
      },
    });
    if (notifyUserId) {
      await createNotification(tx, {
        userId: notifyUserId,
        workspaceId: task.project.workspaceId,
        taskId: data.taskId,
        type: "task.assigned",
        message: `${session.user.name ?? "Someone"} assigned you ${ref}: ${task.title}`,
      });
    }
  });

  const base = `/${task.project.workspace.slug}/${task.project.identifier}`;
  revalidatePath(`${base}/board`);
  revalidatePath(`${base}/list`);
  revalidatePath(`${base}/${task.number}`);
  return { success: true as const };
}
