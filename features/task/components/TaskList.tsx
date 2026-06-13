"use client";

import type { TaskSummary } from "@/features/task/queries/get-tasks";
import { TaskRow } from "@/features/task/components/TaskRow";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TaskList({
  tasks,
  workspaceSlug,
  projectIdentifier,
  canEdit,
}: {
  tasks: TaskSummary[];
  workspaceSlug: string;
  projectIdentifier: string;
  canEdit: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="Create a task or adjust the filters to see results."
      />
    );
  }

  return (
    <div className="px-6 pb-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-44">Status</TableHead>
            <TableHead className="w-32">Priority</TableHead>
            <TableHead className="w-44">Assignee</TableHead>
            <TableHead className="w-32">Due date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              workspaceSlug={workspaceSlug}
              projectIdentifier={projectIdentifier}
              canEdit={canEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
