import type { ProjectSummary } from "@/features/project/queries/get-projects";
import { CreateProjectDialog } from "@/features/project/components/CreateProjectDialog";
import { SidebarLink } from "@/components/SidebarLink";

export function ProjectSidebar({
  workspaceSlug,
  workspaceId,
  projects,
  canCreate,
}: {
  workspaceSlug: string;
  workspaceId: string;
  projects: ProjectSummary[];
  canCreate: boolean;
}) {
  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col px-3">
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Projects
        </span>
        {canCreate ? <CreateProjectDialog workspaceId={workspaceId} /> : null}
      </div>
      <div className="space-y-0.5 overflow-y-auto">
        {projects.map((project) => (
          <SidebarLink key={project.id} href={`/${workspaceSlug}/${project.identifier}`}>
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span className="truncate">{project.name}</span>
          </SidebarLink>
        ))}
        {projects.length === 0 ? (
          <p className="px-2 py-1.5 text-sm text-gray-600">No projects yet</p>
        ) : null}
      </div>
    </div>
  );
}
