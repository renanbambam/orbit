import { prisma } from "@/lib/prisma";

export async function getNotifications(userId: string, limit = 15) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        message: true,
        readAt: true,
        createdAt: true,
        task: {
          select: {
            number: true,
            project: {
              select: { identifier: true, workspace: { select: { slug: true } } },
            },
          },
        },
      },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return { notifications, unreadCount };
}

export type NotificationEntry = Awaited<
  ReturnType<typeof getNotifications>
>["notifications"][number];
