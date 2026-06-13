"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Tag } from "lucide-react";
import type { LabelOption } from "@/features/task/queries/get-labels";
import { toggleTaskLabel } from "@/features/task/actions/toggle-task-label.action";
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

export function LabelPicker({
  taskId,
  labels,
  activeLabelIds,
  disabled = false,
}: {
  taskId: string;
  labels: LabelOption[];
  activeLabelIds: string[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const active = new Set(activeLabelIds);

  function handleToggle(labelId: string) {
    startTransition(async () => {
      const result = await toggleTaskLabel({ taskId, labelId });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 w-full justify-start font-normal text-muted-foreground"
        >
          <Tag className="size-4" />
          {active.size > 0 ? `${active.size} label${active.size > 1 ? "s" : ""}` : "Add labels"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search labels..." />
          <CommandList>
            <CommandEmpty>No labels in this project.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => (
                <CommandItem
                  key={label.id}
                  value={label.name}
                  onSelect={() => handleToggle(label.id)}
                  disabled={isPending}
                >
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: label.color }} />
                  <span className="flex-1">{label.name}</span>
                  {active.has(label.id) ? <Check className="size-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
