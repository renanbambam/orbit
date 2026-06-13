import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { getProjectByIdentifier } from "@/features/project/queries/get-project";
import { ProjectHeader } from "@/features/project/components/ProjectHeader";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string; projectIdentifier: string }>;
}) {
  const { workspaceSlug, projectIdentifier } = await params;
  const session = await requireAuth();

  const workspace = await getWorkspaceBySlug(workspaceSlug, session.user.id);
  if (!workspace) {
    redirect("/onboarding");
  }

  const project = await getProjectByIdentifier(projectIdentifier, workspace.id);
  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <ProjectHeader
        workspaceSlug={workspaceSlug}
        project={project}
        canEdit={workspace.role !== "VIEWER"}
      />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
