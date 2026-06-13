"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  addDependencySchema,
  type AddDependencyInput,
} from "@/features/task/schemas/task.schemas";

async function wouldCreateCycle(blockingId: string, blockedId: string) {
  const visited = new Set<string>();
  const stack = [blockedId];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    if (current === blockingId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    const downstream = await prisma.taskDependency.findMany({
      where: { blockingId: current },
      select: { blockedId: true },
    });
    stack.push(...downstream.map((edge) => edge.blockedId));
  }

  return false;
}

export async function addDependency(input: AddDependencyInput) {
  const session = await requireAuth();
  const data = addDependencySchema.parse(input);

  if (data.taskId === data.blockedByTaskId) {
    return { error: "A task cannot depend on itself" };
  }

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

  const blocker = await prisma.task.findUnique({
    where: { id: data.blockedByTaskId },
    select: { projectId: true },
  });
  if (!blocker || blocker.projectId !== task.projectId) {
    return { error: "Both tasks must belong to the same project" };
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

  if (await wouldCreateCycle(data.blockedByTaskId, data.taskId)) {
    return { error: "This dependency would create a cycle" };
  }

  await prisma.taskDependency.upsert({
    where: {
      blockingId_blockedId: { blockingId: data.blockedByTaskId, blockedId: data.taskId },
    },
    update: {},
    create: { blockingId: data.blockedByTaskId, blockedId: data.taskId },
  });

  revalidatePath(`/${task.project.workspace.slug}/${task.project.identifier}/${task.number}`);
  return { success: true as const };
}
