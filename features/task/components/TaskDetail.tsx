"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, Trash2 } from "lucide-react";
import type { TaskPriority } from "@prisma/client";
import type { TaskDetailData } from "@/features/task/queries/get-task";
import type { LabelOption } from "@/features/task/queries/get-labels";
import { updateTask } from "@/features/task/actions/update-task.action";
import { deleteTask } from "@/features/task/actions/delete-task.action";
import { TASK_PRIORITIES } from "@/features/task/task.constants";
import { AssigneePicker, type AssigneeOption } from "@/features/task/components/AssigneePicker";
import { TaskStatusSelect } from "@/features/task/components/TaskStatusSelect";
import { TaskAttachments } from "@/features/task/components/TaskAttachments";
import { LabelPicker } from "@/features/task/components/LabelPicker";
import { TaskDependencies } from "@/features/task/components/TaskDependencies";
import { CommentList } from "@/features/task/components/CommentList";
import { CommentForm } from "@/features/task/components/CommentForm";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function TaskDetail({
  task,
  members,
  labels,
  dependencyCandidates,
  workspaceSlug,
  projectIdentifier,
  currentUserId,
  canEdit,
  canModerate,
}: {
  task: TaskDetailData;
  members: AssigneeOption[];
  labels: LabelOption[];
  dependencyCandidates: { id: string; number: number; title: string }[];
  workspaceSlug: string;
  projectIdentifier: string;
  currentUserId: string;
  canEdit: boolean;
  canModerate: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  function save(fields: Parameters<typeof updateTask>[0]) {
    startTransition(async () => {
      const result = await updateTask(fields);
      if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTask({ taskId: task.id });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Task deleted");
      router.push(`/${result.slug}/${result.identifier}/board`);
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8 lg:flex-row">
      <div className="min-w-0 flex-1 space-y-8">
        <div>
          <Link
            href={`/${workspaceSlug}/${projectIdentifier}/board`}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to board
          </Link>
          <p className="text-sm font-medium text-muted-foreground">
            {projectIdentifier}-{task.number}
          </p>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => {
              if (title.trim() && title !== task.title) {
                save({ taskId: task.id, title: title.trim() });
              }
            }}
            disabled={!canEdit}
            className="mt-1 border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0 md:text-2xl"
          />
          {task.labels.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {task.labels.map(({ label }) => (
                <span
                  key={label.id}
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Description</h2>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => {
              if (description !== (task.description ?? "")) {
                save({ taskId: task.id, description: description || null });
              }
            }}
            disabled={!canEdit}
            placeholder="Add a description..."
            rows={6}
          />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Attachments</h2>
          <TaskAttachments taskId={task.id} attachments={task.attachments} canEdit={canEdit} />
        </div>
        <Separator />
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Comments ({task.comments.length})
          </h2>
          <CommentList
            comments={task.comments}
            currentUserId={currentUserId}
            canModerate={canModerate}
          />
          <CommentForm taskId={task.id} />
        </div>
      </div>
      <aside className="w-full shrink-0 space-y-5 lg:w-64">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <TaskStatusSelect
            taskId={task.id}
            status={task.status}
            disabled={!canEdit}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Priority</p>
          <Select
            value={task.priority}
            onValueChange={(priority) =>
              save({ taskId: task.id, priority: priority as TaskPriority })
            }
            disabled={!canEdit || isPending}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Assignee</p>
          <AssigneePicker
            members={members}
            value={task.assignee?.id ?? null}
            onSelect={(assigneeId) => save({ taskId: task.id, assigneeId })}
            disabled={!canEdit || isPending}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Due date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!canEdit || isPending}
                className={cn(
                  "h-8 w-full justify-start font-normal",
                  !task.dueDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="size-4" />
                {task.dueDate ? format(task.dueDate, "MMM d, yyyy") : "No due date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={task.dueDate ?? undefined}
                onSelect={(date) => save({ taskId: task.id, dueDate: date ?? null })}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Labels</p>
          <LabelPicker
            taskId={task.id}
            labels={labels}
            activeLabelIds={task.labels.map(({ label }) => label.id)}
            disabled={!canEdit}
          />
        </div>
        <Separator />
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Blocked by</p>
          <TaskDependencies
            taskId={task.id}
            workspaceSlug={workspaceSlug}
            projectIdentifier={projectIdentifier}
            blockedBy={task.blockedBy.map((entry) => ({
              id: entry.id,
              task: entry.blocking,
            }))}
            candidates={dependencyCandidates}
            canEdit={canEdit}
          />
        </div>
        {task.blocking.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Blocking</p>
            <ul className="space-y-1 text-sm">
              {task.blocking.map((entry) => (
                <li key={entry.id} className="truncate">
                  <Link
                    href={`/${workspaceSlug}/${projectIdentifier}/${entry.blocked.number}`}
                    className="hover:underline"
                  >
                    <span className="mr-1.5 text-muted-foreground">
                      {projectIdentifier}-{entry.blocked.number}
                    </span>
                    {entry.blocked.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Separator />
        <div className="space-y-1.5 text-sm">
          <p className="text-xs font-medium text-muted-foreground">Created by</p>
          <span className="flex items-center gap-2">
            <UserAvatar name={task.creator.name} image={task.creator.image} className="size-6" />
            {task.creator.name}
          </span>
          <p className="pt-1 text-xs text-muted-foreground">
            {format(task.createdAt, "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        {canEdit ? (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="size-4" />
            Delete task
          </Button>
        ) : null}
      </aside>
    </div>
  );
}
