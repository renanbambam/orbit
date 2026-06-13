import { addHours } from "date-fns";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/features/notification/notification.helpers";

async function sendReminderEmail(to: string, taskRef: string, title: string, link: string) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "noreply@orbit.app",
    to,
    subject: `${taskRef} is due soon`,
    html: `<p><strong>${taskRef}: ${title}</strong> is due within 24 hours.</p><p><a href="${link}">Open the task</a></p>`,
  });
}

export async function sendDueReminders() {
  const now = new Date();
  const horizon = addHours(now, 24);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: { gte: now, lte: horizon },
      reminderSentAt: null,
      assigneeId: { not: null },
      status: { notIn: ["DONE", "CANCELLED"] },
    },
    select: {
      id: true,
      number: true,
      title: true,
      assigneeId: true,
      assignee: { select: { email: true } },
      project: {
        select: { identifier: true, workspaceId: true, workspace: { select: { slug: true } } },
      },
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  let sent = 0;

  for (const task of tasks) {
    if (!task.assigneeId) continue;
    const ref = `${task.project.identifier}-${task.number}`;
    const link = `${baseUrl}/${task.project.workspace.slug}/${task.project.identifier}/${task.number}`;

    await prisma.$transaction([
      createNotification(prisma, {
        userId: task.assigneeId,
        workspaceId: task.project.workspaceId,
        taskId: task.id,
        type: "task.due_soon",
        message: `${ref} "${task.title}" is due within 24 hours`,
      }),
      prisma.task.update({
        where: { id: task.id },
        data: { reminderSentAt: now },
      }),
    ]);

    if (task.assignee?.email) {
      await sendReminderEmail(task.assignee.email, ref, task.title, link);
    }
    sent += 1;
  }

  return { sent };
}
