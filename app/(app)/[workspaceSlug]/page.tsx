import { redirect } from "next/navigation";
import { CheckCircle2, CircleDashed, Clock, ListTodo } from "lucide-react";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { getDashboardStats } from "@/features/dashboard/queries/get-dashboard-stats";
import { getActivityFeed } from "@/features/dashboard/queries/get-activity-feed";
import { TaskCompletionChart } from "@/features/dashboard/components/TaskCompletionChart";
import { StatusDistributionChart } from "@/features/dashboard/components/StatusDistributionChart";
import { TeamVelocityChart } from "@/features/dashboard/components/TeamVelocityChart";
import { UpcomingDeadlines } from "@/features/dashboard/components/UpcomingDeadlines";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Dashboard | Orbit" };

const STAT_CARDS = [
  { key: "total", label: "Total tasks", icon: ListTodo },
  { key: "inProgress", label: "In progress", icon: CircleDashed },
  { key: "done", label: "Completed", icon: CheckCircle2 },
  { key: "overdue", label: "Overdue", icon: Clock },
] as const;

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const session = await requireAuth();

  const workspace = await getWorkspaceBySlug(workspaceSlug, session.user.id);
  if (!workspace) {
    redirect("/onboarding");
  }

  const [stats, activity] = await Promise.all([
    getDashboardStats(workspace.id),
    getActivityFeed(workspace.id),
  ]);

  return (
    <div className="px-6 py-8">
      <PageHeader
        title="Dashboard"
        description={`What's happening across ${workspace.name}.`}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold">{stats.counts[card.key]}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border p-5 xl:col-span-2">
          <h2 className="mb-4 font-medium">Tasks completed — last 30 days</h2>
          <TaskCompletionChart data={stats.completionByDay} />
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="mb-4 font-medium">Tasks by status</h2>
          <StatusDistributionChart data={stats.statusDistribution} />
        </div>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="mb-4 font-medium">Team velocity — this week</h2>
          <TeamVelocityChart data={stats.velocity} />
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="mb-4 font-medium">Upcoming deadlines</h2>
          <UpcomingDeadlines tasks={stats.upcomingTasks} workspaceSlug={workspaceSlug} />
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="mb-4 font-medium">Recent activity</h2>
          <ActivityFeed entries={activity} />
        </div>
      </div>
    </div>
  );
}
