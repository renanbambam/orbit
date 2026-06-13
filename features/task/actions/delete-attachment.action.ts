"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";

const deleteAttachmentSchema = z.object({
  attachmentId: z.string().min(1),
});

export async function deleteAttachment(input: z.infer<typeof deleteAttachmentSchema>) {
  const session = await requireAuth();
  const data = deleteAttachmentSchema.parse(input);

  const attachment = await prisma.taskAttachment.findUnique({
    where: { id: data.attachmentId },
    select: {
      task: {
        select: {
          number: true,
          project: {
            select: { identifier: true, workspaceId: true, workspace: { select: { slug: true } } },
          },
        },
      },
    },
  });
  if (!attachment) {
    return { error: "Attachment not found" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: attachment.task.project.workspaceId,
        userId: session.user.id,
      },
    },
    select: { role: true },
  });
  if (!membership || membership.role === "VIEWER") {
    return { error: "You do not have permission to delete attachments" };
  }

  await prisma.taskAttachment.delete({ where: { id: data.attachmentId } });

  revalidatePath(
    `/${attachment.task.project.workspace.slug}/${attachment.task.project.identifier}/${attachment.task.number}`,
  );
  return { success: true as const };
}
