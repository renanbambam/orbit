"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import { generateSlug } from "@/lib/utils";
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from "@/features/workspace/schemas/workspace.schemas";

export async function createWorkspace(input: CreateWorkspaceInput) {
  const session = await requireAuth();
  const data = createWorkspaceSchema.parse(input);

  const workspace = await prisma.workspace.create({
    data: {
      name: data.name,
      slug: generateSlug(data.name),
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
    select: { slug: true },
  });

  revalidatePath("/onboarding");
  return { slug: workspace.slug };
}
