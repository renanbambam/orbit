"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import { createNotification } from "@/features/notification/notification.helpers";
import { createTaskSchema, type CreateTaskInput } from "@/features/task/schemas/task.schemas";

export async function createTask(input: CreateTaskInput) {
  const session = await requireAuth();
  const data = createTaskSchema.parse(input);

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
    return { error: "You do not have permission to create tasks" };
  }

  const task = await prisma.$transaction(async (tx) => {
    const max = await tx.task.aggregate({
      where: { projectId: data.projectId },
      _max: { number: true },
    });
    const created = await tx.task.create({
      data: {
        projectId: data.projectId,
        number: (max._max.number ?? 0) + 1,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigneeId: data.assigneeId ?? null,
        dueDate: data.dueDate ?? null,
        completedAt: data.status === "DONE" ? new Date() : null,
        creatorId: session.user.id,
      },
      select: { id: true, number: true },
    });
    await tx.activityLog.create({
      data: {
        workspaceId: project.workspaceId,
        taskId: created.id,
        actorId: session.user.id,
        action: "task.created",
        metadata: { title: data.title, number: created.number, identifier: project.identifier },
      },
    });
    if (data.assigneeId && data.assigneeId !== session.user.id) {
      await createNotification(tx, {
        userId: data.assigneeId,
        workspaceId: project.workspaceId,
        taskId: created.id,
        type: "task.assigned",
        message: `${session.user.name ?? "Someone"} assigned you ${project.identifier}-${created.number}: ${data.title}`,
      });
    }
    return created;
  });

  const base = `/${project.workspace.slug}/${project.identifier}`;
  revalidatePath(`${base}/board`);
  revalidatePath(`${base}/list`);
  revalidatePath(`/${project.workspace.slug}`);
  return { number: task.number };
}
