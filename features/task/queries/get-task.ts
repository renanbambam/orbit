import { prisma } from "@/lib/prisma";

export async function getTask(projectId: string, number: number) {
  return prisma.task.findUnique({
    where: { projectId_number: { projectId, number } },
    select: {
      id: true,
      number: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      completedAt: true,
      createdAt: true,
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      labels: {
        select: { label: { select: { id: true, name: true, color: true } } },
      },
      blockedBy: {
        select: {
          id: true,
          blocking: { select: { id: true, number: true, title: true, status: true } },
        },
      },
      blocking: {
        select: {
          id: true,
          blocked: { select: { id: true, number: true, title: true, status: true } },
        },
      },
      attachments: {
        orderBy: { uploadedAt: "desc" },
        select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
}

export type TaskDetailData = NonNullable<Awaited<ReturnType<typeof getTask>>>;
