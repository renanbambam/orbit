"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";
import {
  deleteCommentSchema,
  type DeleteCommentInput,
} from "@/features/task/schemas/task.schemas";

export async function deleteComment(input: DeleteCommentInput) {
  const session = await requireAuth();
  const data = deleteCommentSchema.parse(input);

  const comment = await prisma.taskComment.findUnique({
    where: { id: data.commentId },
    select: {
      authorId: true,
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
  if (!comment) {
    return { error: "Comment not found" };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: comment.task.project.workspaceId,
        userId: session.user.id,
      },
    },
    select: { role: true },
  });
  const isAuthor = comment.authorId === session.user.id;
  const isAdmin = membership?.role === "OWNER" || membership?.role === "ADMIN";
  if (!membership || (!isAuthor && !isAdmin)) {
    return { error: "You do not have permission to delete this comment" };
  }

  await prisma.taskComment.delete({ where: { id: data.commentId } });

  revalidatePath(
    `/${comment.task.project.workspace.slug}/${comment.task.project.identifier}/${comment.task.number}`,
  );
  return { success: true as const };
}
