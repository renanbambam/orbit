import { PrismaClient, type TaskPriority, type TaskStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

type SeedTask = {
  project: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: number | null;
  dueInDays?: number;
  completedDaysAgo?: number;
};

const TASKS: SeedTask[] = [
  { project: 0, title: "Audit current landing page performance", status: "DONE", priority: "HIGH", assignee: 0, completedDaysAgo: 24 },
  { project: 0, title: "Define new visual identity", status: "DONE", priority: "HIGH", assignee: 1, completedDaysAgo: 19 },
  { project: 0, title: "Design hero section variants", status: "DONE", priority: "MEDIUM", assignee: 1, completedDaysAgo: 12 },
  { project: 0, title: "Implement responsive navigation", status: "DONE", priority: "MEDIUM", assignee: 2, completedDaysAgo: 6 },
  { project: 0, title: "Migrate blog to MDX", status: "DONE", priority: "LOW", assignee: 2, completedDaysAgo: 2 },
  { project: 0, title: "Build pricing page", status: "IN_REVIEW", priority: "HIGH", assignee: 2, dueInDays: 3 },
  { project: 0, title: "Add testimonials carousel", status: "IN_PROGRESS", priority: "MEDIUM", assignee: 1, dueInDays: 5 },
  { project: 0, title: "Optimize image loading", status: "IN_PROGRESS", priority: "MEDIUM", assignee: 0, dueInDays: 6 },
  { project: 0, title: "Set up A/B testing framework", status: "TODO", priority: "LOW", assignee: null, dueInDays: 10 },
  { project: 0, title: "Write copy for features section", status: "TODO", priority: "MEDIUM", assignee: 0, dueInDays: 4 },
  { project: 0, title: "Accessibility audit", status: "BACKLOG", priority: "HIGH", assignee: null },
  { project: 0, title: "Dark mode support", status: "BACKLOG", priority: "LOW", assignee: null },
  { project: 1, title: "Set up React Native project", status: "DONE", priority: "URGENT", assignee: 2, completedDaysAgo: 15 },
  { project: 1, title: "Implement auth flow", status: "DONE", priority: "HIGH", assignee: 2, completedDaysAgo: 8 },
  { project: 1, title: "Push notification service", status: "IN_REVIEW", priority: "HIGH", assignee: 0, dueInDays: 2 },
  { project: 1, title: "Offline task caching", status: "IN_PROGRESS", priority: "URGENT", assignee: 2, dueInDays: 1 },
  { project: 1, title: "Board view gestures", status: "TODO", priority: "MEDIUM", assignee: 1, dueInDays: 7 },
  { project: 1, title: "App store screenshots", status: "TODO", priority: "LOW", assignee: 1, dueInDays: 14 },
  { project: 1, title: "Deep linking support", status: "BACKLOG", priority: "MEDIUM", assignee: null },
  { project: 1, title: "Evaluate Expo upgrade", status: "CANCELLED", priority: "NO_PRIORITY", assignee: null },
];

async function main() {
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceInvite.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("password123", 12);
  const users = await Promise.all(
    [
      { name: "Ada Lovelace", email: "ada@orbit.test" },
      { name: "Grace Hopper", email: "grace@orbit.test" },
      { name: "Alan Turing", email: "alan@orbit.test" },
    ].map((user) => prisma.user.create({ data: { ...user, passwordHash } })),
  );

  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Inc",
      slug: "acme-inc",
      members: {
        create: [
          { userId: users[0].id, role: "OWNER" },
          { userId: users[1].id, role: "ADMIN" },
          { userId: users[2].id, role: "MEMBER" },
        ],
      },
    },
  });

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: "Website Redesign",
        identifier: "WEB",
        description: "Refresh the marketing site with the new brand.",
        color: "#6366f1",
      },
    }),
    prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: "Mobile App",
        identifier: "APP",
        description: "Native companion app for iOS and Android.",
        color: "#10b981",
      },
    }),
  ]);

  const now = new Date();
  const counters = [0, 0];

  for (const definition of TASKS) {
    counters[definition.project] += 1;
    const completedAt = definition.completedDaysAgo
      ? subDays(now, definition.completedDaysAgo)
      : null;
    const task = await prisma.task.create({
      data: {
        projectId: projects[definition.project].id,
        number: counters[definition.project],
        title: definition.title,
        status: definition.status,
        priority: definition.priority,
        assigneeId: definition.assignee === null ? null : users[definition.assignee].id,
        creatorId: users[0].id,
        dueDate: definition.dueInDays ? addDays(now, definition.dueInDays) : null,
        completedAt,
        createdAt: subDays(now, 28),
      },
    });
    await prisma.activityLog.create({
      data: {
        workspaceId: workspace.id,
        taskId: task.id,
        actorId: users[0].id,
        action: "task.created",
        metadata: {
          title: task.title,
          number: task.number,
          identifier: projects[definition.project].identifier,
        },
        createdAt: subDays(now, 28),
      },
    });
    if (completedAt) {
      await prisma.activityLog.create({
        data: {
          workspaceId: workspace.id,
          taskId: task.id,
          actorId: definition.assignee === null ? users[0].id : users[definition.assignee].id,
          action: "task.status_changed",
          metadata: {
            number: task.number,
            identifier: projects[definition.project].identifier,
            from: "IN_PROGRESS",
            to: "DONE",
          },
          createdAt: completedAt,
        },
      });
    }
  }

  const pricingTask = await prisma.task.findFirstOrThrow({
    where: { title: "Build pricing page" },
  });
  await prisma.taskComment.create({
    data: {
      taskId: pricingTask.id,
      authorId: users[1].id,
      content: "Tier comparison table looks great, just needs the annual toggle.",
    },
  });

  const labelDefs = [
    { project: 0, name: "design", color: "#ec4899" },
    { project: 0, name: "frontend", color: "#3b82f6" },
    { project: 0, name: "content", color: "#f59e0b" },
    { project: 1, name: "ios", color: "#8b5cf6" },
    { project: 1, name: "backend", color: "#10b981" },
  ];
  const labels = await Promise.all(
    labelDefs.map((label) =>
      prisma.label.create({
        data: { projectId: projects[label.project].id, name: label.name, color: label.color },
      }),
    ),
  );

  const labelByName = new Map(labels.map((label) => [label.name, label.id]));
  const labelAssignments: { title: string; labels: string[] }[] = [
    { title: "Design hero section variants", labels: ["design", "frontend"] },
    { title: "Build pricing page", labels: ["frontend"] },
    { title: "Write copy for features section", labels: ["content"] },
    { title: "Push notification service", labels: ["backend"] },
    { title: "Board view gestures", labels: ["ios"] },
  ];
  for (const assignment of labelAssignments) {
    const task = await prisma.task.findFirstOrThrow({ where: { title: assignment.title } });
    await prisma.taskLabel.createMany({
      data: assignment.labels
        .map((name) => labelByName.get(name))
        .filter((id): id is string => Boolean(id))
        .map((labelId) => ({ taskId: task.id, labelId })),
    });
  }

  const pricingPageTask = await prisma.task.findFirstOrThrow({
    where: { title: "Add testimonials carousel" },
  });
  await prisma.taskDependency.create({
    data: { blockingId: pricingTask.id, blockedId: pricingPageTask.id },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: users[2].id,
        workspaceId: workspace.id,
        taskId: pricingTask.id,
        type: "comment.added",
        message: 'Grace Hopper commented on WEB-6: Build pricing page',
      },
      {
        userId: users[1].id,
        workspaceId: workspace.id,
        taskId: pricingPageTask.id,
        type: "task.assigned",
        message: 'Ada Lovelace assigned you WEB-7: Add testimonials carousel',
        readAt: subDays(now, 1),
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
