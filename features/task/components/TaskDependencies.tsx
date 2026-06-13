"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import type { TaskStatus } from "@prisma/client";
import { addDependency } from "@/features/task/actions/add-dependency.action";
import { removeDependency } from "@/features/task/actions/remove-dependency.action";
import { statusMeta } from "@/features/task/task.constants";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DependencyTask = {
  id: string;
  number: number;
  title: string;
  status: TaskStatus;
};

type CandidateTask = {
  id: string;
  number: number;
  title: string;
};

export function TaskDependencies({
  taskId,
  workspaceSlug,
  projectIdentifier,
  blockedBy,
  candidates,
  canEdit,
}: {
  taskId: string;
  workspaceSlug: string;
  projectIdentifier: string;
  blockedBy: { id: string; task: DependencyTask }[];
  candidates: CandidateTask[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const blockedIds = new Set(blockedBy.map((entry) => entry.task.id));
  const selectable = candidates.filter(
    (candidate) => candidate.id !== taskId && !blockedIds.has(candidate.id),
  );

  function handleAdd(blockedByTaskId: string) {
    startTransition(async () => {
      const result = await addDependency({ taskId, blockedByTaskId });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function handleRemove(dependencyId: string) {
    startTransition(async () => {
      const result = await removeDependency({ dependencyId });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {blockedBy.length > 0 ? (
        <ul className="space-y-1.5">
          {blockedBy.map((entry) => {
            const meta = statusMeta(entry.task.status);
            return (
              <li key={entry.id} className="flex items-center gap-2 text-sm">
                <span className={cn("size-2 shrink-0 rounded-full", meta.dotClass)} />
                <Link
                  href={`/${workspaceSlug}/${projectIdentifier}/${entry.task.number}`}
                  className="min-w-0 flex-1 truncate hover:underline"
                >
                  <span className="mr-1.5 text-muted-foreground">
                    {projectIdentifier}-{entry.task.number}
                  </span>
                  {entry.task.title}
                </Link>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.id)}
                    disabled={isPending}
                    aria-label="Remove dependency"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No blocking tasks.</p>
      )}
      {canEdit ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-full justify-start font-normal">
              <Plus className="size-4" />
              Add blocker
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tasks..." />
              <CommandList>
                <CommandEmpty>No tasks available.</CommandEmpty>
                <CommandGroup>
                  {selectable.map((candidate) => (
                    <CommandItem
                      key={candidate.id}
                      value={`${projectIdentifier}-${candidate.number} ${candidate.title}`}
                      onSelect={() => handleAdd(candidate.id)}
                      disabled={isPending}
                    >
                      <span className="mr-1.5 text-muted-foreground">
                        {projectIdentifier}-{candidate.number}
                      </span>
                      <span className="truncate">{candidate.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
