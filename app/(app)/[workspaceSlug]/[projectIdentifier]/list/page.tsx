import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { getWorkspaceMembers } from "@/features/workspace/queries/get-members";
import { getProjectByIdentifier } from "@/features/project/queries/get-project";
import { getTasksByProject } from "@/features/task/queries/get-tasks";
import { getLabelsByProject } from "@/features/task/queries/get-labels";
import { taskFiltersSchema } from "@/features/task/schemas/task.schemas";
import { TaskList } from "@/features/task/components/TaskList";
import { TaskFilters } from "@/features/task/components/TaskFilters";
import { CreateTaskDialog } from "@/features/task/components/CreateTaskDialog";

export const metadata = { title: "List | Orbit" };

export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; projectIdentifier: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ workspaceSlug, projectIdentifier }, query] = await Promise.all([params, searchParams]);
  const session = await requireAuth();

  const workspace = await getWorkspaceBySlug(workspaceSlug, session.user.id);
  if (!workspace) {
    redirect("/onboarding");
  }

  const project = await getProjectByIdentifier(projectIdentifier, workspace.id);
  if (!project) {
    notFound();
  }

  const parsedFilters = taskFiltersSchema.safeParse(query);
  const { status, priority, assigneeId, labelId, search } = parsedFilters.success
    ? parsedFilters.data
    : {};
  const [tasks, { members }, labels] = await Promise.all([
    getTasksByProject({
      projectId: project.id,
      status: status ? [status] : undefined,
      priority: priority ? [priority] : undefined,
      assigneeId,
      labelId,
      search,
    }),
    getWorkspaceMembers(workspace.id),
    getLabelsByProject(project.id),
  ]);

  const memberOptions = members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    image: member.user.image,
  }));
  const canEdit = workspace.role !== "VIEWER";

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-4 px-6 pt-4">
        <TaskFilters members={memberOptions} labels={labels} />
        {canEdit ? <CreateTaskDialog projectId={project.id} members={memberOptions} /> : null}
      </div>
      <TaskList
        tasks={tasks}
        workspaceSlug={workspaceSlug}
        projectIdentifier={projectIdentifier}
        canEdit={canEdit}
      />
    </div>
  );
}
