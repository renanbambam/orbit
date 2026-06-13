import Link from "next/link";
import { Settings } from "lucide-react";
import type { ProjectDetail } from "@/features/project/queries/get-project";
import { ViewSwitcher } from "@/features/project/components/ViewSwitcher";
import { Button } from "@/components/ui/button";

export function ProjectHeader({
  workspaceSlug,
  project,
  canEdit,
}: {
  workspaceSlug: string;
  project: ProjectDetail;
  canEdit: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{project.name}</h1>
          {project.description ? (
            <p className="truncate text-sm text-muted-foreground">{project.description}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ViewSwitcher workspaceSlug={workspaceSlug} projectIdentifier={project.identifier} />
        {canEdit ? (
          <Button asChild variant="ghost" size="icon" aria-label="Project settings">
            <Link href={`/${workspaceSlug}/${project.identifier}/settings`}>
              <Settings className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
