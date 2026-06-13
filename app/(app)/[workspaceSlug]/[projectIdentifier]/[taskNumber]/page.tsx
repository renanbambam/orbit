import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { getWorkspaceMembers } from "@/features/workspace/queries/get-members";
import { getProjectByIdentifier } from "@/features/project/queries/get-project";
import { getTask } from "@/features/task/queries/get-task";
import { getLabelsByProject } from "@/features/task/queries/get-labels";
import { getTaskOptions } from "@/features/task/queries/get-task-options";
import { TaskDetail } from "@/features/task/components/TaskDetail";

export const metadata = { title: "Task | Orbit" };

export default async function TaskPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectIdentifier: string; taskNumber: string }>;
}) {
  const { workspaceSlug, projectIdentifier, taskNumber } = await params;
  const session = await requireAuth();

  const number = Number.parseInt(taskNumber, 10);
  if (Number.isNaN(number)) {
    notFound();
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug, session.user.id);
  if (!workspace) {
    redirect("/onboarding");
  }

  const project = await getProjectByIdentifier(projectIdentifier, workspace.id);
  if (!project) {
    notFound();
  }

  const [task, { members }, labels, taskOptions] = await Promise.all([
    getTask(project.id, number),
    getWorkspaceMembers(workspace.id),
    getLabelsByProject(project.id),
    getTaskOptions(project.id),
  ]);
  if (!task) {
    notFound();
  }

  const memberOptions = members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    image: member.user.image,
  }));
  const dependencyCandidates = taskOptions.filter((option) => option.id !== task.id);

  return (
    <TaskDetail
      task={task}
      members={memberOptions}
      labels={labels}
      dependencyCandidates={dependencyCandidates}
      workspaceSlug={workspaceSlug}
      projectIdentifier={projectIdentifier}
      currentUserId={session.user.id}
      canEdit={workspace.role !== "VIEWER"}
      canModerate={workspace.role === "OWNER" || workspace.role === "ADMIN"}
    />
  );
}
