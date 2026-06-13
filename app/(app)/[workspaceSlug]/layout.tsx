import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { getUserWorkspaces } from "@/features/workspace/queries/get-workspaces";
import { getProjectsByWorkspace } from "@/features/project/queries/get-projects";
import { getNotifications } from "@/features/notification/queries/get-notifications";
import { AppSidebar } from "@/components/AppSidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const user = await getCurrentUser();

  const workspace = await getWorkspaceBySlug(workspaceSlug, user.id);
  if (!workspace) {
    redirect("/onboarding");
  }

  const [workspaces, projects, { notifications, unreadCount }] = await Promise.all([
    getUserWorkspaces(user.id),
    getProjectsByWorkspace(workspace.id),
    getNotifications(user.id),
  ]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        workspace={workspace}
        workspaces={workspaces}
        projects={projects}
        user={{ name: user.name, email: user.email, image: user.image }}
        notifications={notifications}
        unreadCount={unreadCount}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
