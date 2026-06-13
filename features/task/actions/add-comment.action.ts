"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import { createNotification } from "@/features/notification/notification.helpers";
import { addCommentSchema, type AddCommentInput } from "@/features/task/schemas/task.schemas";

export async function addComment(input: AddCommentInput) {
  const session = await requireAuth();
  const data = addCommentSchema.parse(input);

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
  if (!membership) {
    return { error: "You do not have access to this task" };
  }

  const notifyUserId =
    task.assigneeId && task.assigneeId !== session.user.id ? task.assigneeId : null;
  const ref = `${task.project.identifier}-${task.number}`;

  await prisma.$transaction(async (tx) => {
    await tx.taskComment.create({
      data: {
        taskId: data.taskId,
        authorId: session.user.id,
        content: data.content,
      },
    });
    await tx.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        taskId: data.taskId,
        actorId: session.user.id,
        action: "comment.added",
        metadata: { number: task.number, identifier: task.project.identifier },
      },
    });
    if (notifyUserId) {
      await createNotification(tx, {
        userId: notifyUserId,
        workspaceId: task.project.workspaceId,
        taskId: data.taskId,
        type: "comment.added",
        message: `${session.user.name ?? "Someone"} commented on ${ref}: ${task.title}`,
      });
    }
  });

  revalidatePath(
    `/${task.project.workspace.slug}/${task.project.identifier}/${task.number}`,
  );
  return { success: true as const };
}
