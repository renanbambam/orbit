"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import { deleteTaskSchema, type DeleteTaskInput } from "@/features/task/schemas/task.schemas";

export async function deleteTask(input: DeleteTaskInput) {
  const session = await requireAuth();
  const data = deleteTaskSchema.parse(input);

  const task = await prisma.task.findUnique({
    where: { id: data.taskId },
    select: {
      number: true,
      title: true,
      creatorId: true,
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
  const isCreator = task.creatorId === session.user.id;
  const isAdmin = membership?.role === "OWNER" || membership?.role === "ADMIN";
  if (!membership || (!isCreator && !isAdmin)) {
    return { error: "You do not have permission to delete this task" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.delete({ where: { id: data.taskId } });
    await tx.activityLog.create({
      data: {
        workspaceId: task.project.workspaceId,
        actorId: session.user.id,
        action: "task.deleted",
        metadata: { title: task.title, number: task.number, identifier: task.project.identifier },
      },
    });
  });

  const base = `/${task.project.workspace.slug}/${task.project.identifier}`;
  revalidatePath(`${base}/board`);
  revalidatePath(`${base}/list`);
  revalidatePath(`/${task.project.workspace.slug}`);
  return { slug: task.project.workspace.slug, identifier: task.project.identifier };
}
