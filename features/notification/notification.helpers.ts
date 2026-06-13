import type { Prisma, PrismaClient } from "@prisma/client";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type NotifyInput = {
  userId: string;
  workspaceId: string;
  taskId?: string;
  type: string;
  message: string;
};

export function createNotification(
  client: PrismaClient | TransactionClient,
  input: NotifyInput,
): Prisma.PrismaPromise<unknown> {
  return client.notification.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      taskId: input.taskId,
      type: input.type,
      message: input.message,
    },
  });
}
