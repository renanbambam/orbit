import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

export const fileRouter = {
  taskAttachment: f({ blob: { maxFileSize: "8MB", maxFileCount: 5 } })
    .input(z.object({ taskId: z.string().min(1) }))
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      const task = await prisma.task.findUnique({
        where: { id: input.taskId },
        select: { project: { select: { workspaceId: true } } },
      });
      if (!task) {
        throw new UploadThingError("Task not found");
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: task.project.workspaceId,
            userId: session.user.id,
          },
        },
        select: { role: true },
      });
      if (!membership || membership.role === "VIEWER") {
        throw new UploadThingError("Forbidden");
      }

      return { taskId: input.taskId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.taskAttachment.create({
        data: {
          taskId: metadata.taskId,
          fileName: file.name,
          fileUrl: file.ufsUrl,
          fileSize: file.size,
          mimeType: file.type,
        },
      });
    }),
} satisfies FileRouter;

export type OrbitFileRouter = typeof fileRouter;
