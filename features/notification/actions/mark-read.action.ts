"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth.helpers";

const markReadSchema = z.object({
  notificationId: z.string().min(1),
});

export async function markNotificationRead(input: z.infer<typeof markReadSchema>) {
  const session = await requireAuth();
  const data = markReadSchema.parse(input);

  const result = await prisma.notification.updateMany({
    where: { id: data.notificationId, userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/", "layout");
  return { updated: result.count };
}
