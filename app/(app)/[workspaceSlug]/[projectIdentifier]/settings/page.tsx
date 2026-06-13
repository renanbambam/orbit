import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { getProjectByIdentifier } from "@/features/project/queries/get-project";
import { getLabelsByProject } from "@/features/task/queries/get-labels";
import { ProjectSettingsForm } from "@/features/project/components/ProjectSettingsForm";
import { ProjectLabelsManager } from "@/features/task/components/ProjectLabelsManager";
import { PageHeader } from "@/components/PageHeader";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Project settings | Orbit" };

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectIdentifier: string }>;
}) {
  const { workspaceSlug, projectIdentifier } = await params;
  const session = await requireAuth();

  const workspace = await getWorkspaceBySlug(workspaceSlug, session.user.id);
  if (!workspace) {
    redirect("/onboarding");
  }
  if (workspace.role === "VIEWER") {
    redirect(`/${workspaceSlug}/${projectIdentifier}/board`);
  }

  const project = await getProjectByIdentifier(projectIdentifier, workspace.id);
  if (!project) {
    notFound();
  }

  const labels = await getLabelsByProject(project.id);

  return (
    <div className="px-6 py-8">
      <PageHeader title="Project settings" description="Update details or archive this project." />
      <ProjectSettingsForm
        project={project}
        canArchive={workspace.role === "OWNER" || workspace.role === "ADMIN"}
      />
      <Separator className="my-10 max-w-lg" />
      <div className="space-y-4">
        <div>
          <h2 className="font-medium">Labels</h2>
          <p className="text-sm text-muted-foreground">
            Labels help categorize and filter tasks within this project.
          </p>
        </div>
        <ProjectLabelsManager projectId={project.id} labels={labels} canManage />
      </div>
    </div>
  );
}
