import { LayoutDashboard, Settings, Users } from "lucide-react";
import type { CurrentWorkspace } from "@/features/workspace/queries/get-workspace";
import type { WorkspaceSummary } from "@/features/workspace/queries/get-workspaces";
import type { ProjectSummary } from "@/features/project/queries/get-projects";
import type { NotificationEntry } from "@/features/notification/queries/get-notifications";
import { WorkspaceSwitcher } from "@/features/workspace/components/WorkspaceSwitcher";
import { NotificationCenter } from "@/features/notification/components/NotificationCenter";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { SidebarLink } from "@/components/SidebarLink";
import { UserMenu } from "@/components/UserMenu";

export function AppSidebar({
  workspace,
  workspaces,
  projects,
  user,
  notifications,
  unreadCount,
}: {
  workspace: CurrentWorkspace;
  workspaces: WorkspaceSummary[];
  projects: ProjectSummary[];
  user: { name: string; email: string; image?: string | null };
  notifications: NotificationEntry[];
  unreadCount: number;
}) {
  const canCreateProjects = workspace.role !== "VIEWER";

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-800 bg-gray-950">
      <div className="flex items-center gap-1 p-3">
        <div className="min-w-0 flex-1">
          <WorkspaceSwitcher workspaces={workspaces} currentSlug={workspace.slug} />
        </div>
        <NotificationCenter notifications={notifications} unreadCount={unreadCount} />
      </div>
      <nav className="space-y-0.5 px-3">
        <SidebarLink href={`/${workspace.slug}`} exact>
          <LayoutDashboard className="size-4" />
          Dashboard
        </SidebarLink>
        <SidebarLink href={`/${workspace.slug}/settings/members`}>
          <Users className="size-4" />
          Members
        </SidebarLink>
        <SidebarLink href={`/${workspace.slug}/settings`} exact>
          <Settings className="size-4" />
          Settings
        </SidebarLink>
      </nav>
      <ProjectSidebar
        workspaceSlug={workspace.slug}
        workspaceId={workspace.id}
        projects={projects}
        canCreate={canCreateProjects}
      />
      <div className="mt-auto border-t border-gray-800 p-3">
        <UserMenu name={user.name} email={user.email} image={user.image} />
      </div>
    </aside>
  );
}
