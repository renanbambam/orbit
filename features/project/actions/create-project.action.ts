"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/features/project/schemas/project.schemas";

export async function createProject(input: CreateProjectInput) {
  const session = await requireAuth();
  const data = createProjectSchema.parse(input);

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: data.workspaceId, userId: session.user.id },
    },
    select: { role: true, workspace: { select: { slug: true } } },
  });
  if (!membership || membership.role === "VIEWER") {
    return { error: "You do not have permission to create projects" };
  }

  try {
    const project = await prisma.project.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        identifier: data.identifier,
        description: data.description,
        color: data.color,
      },
      select: { identifier: true },
    });

    revalidatePath(`/${membership.workspace.slug}`);
    return { identifier: project.identifier, slug: membership.workspace.slug };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A project with this identifier already exists" };
    }
    throw error;
  }
}
