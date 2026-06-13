"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { LabelOption } from "@/features/task/queries/get-labels";
import { createLabel } from "@/features/task/actions/create-label.action";
import { deleteLabel } from "@/features/task/actions/delete-label.action";
import { PROJECT_COLORS } from "@/features/project/schemas/project.schemas";
import { ColorSwatchPicker } from "@/features/project/components/ColorSwatchPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectLabelsManager({
  projectId,
  labels,
  canManage,
}: {
  projectId: string;
  labels: LabelOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PROJECT_COLORS[0]);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await createLabel({ projectId, name: trimmed, color });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setName("");
      setColor(PROJECT_COLORS[0]);
      router.refresh();
    });
  }

  function handleDelete(labelId: string) {
    startTransition(async () => {
      const result = await deleteLabel({ labelId });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="max-w-lg space-y-4">
      {labels.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <li
              key={label.id}
              className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
              {canManage ? (
                <button
                  type="button"
                  onClick={() => handleDelete(label.id)}
                  disabled={isPending}
                  aria-label={`Delete label ${label.name}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No labels yet.</p>
      )}
      {canManage ? (
        <div className="space-y-3 rounded-lg border p-4">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Label name"
            maxLength={30}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleCreate();
              }
            }}
          />
          <ColorSwatchPicker value={color} onChange={setColor} />
          <Button size="sm" onClick={handleCreate} disabled={isPending || !name.trim()}>
            <Plus className="size-4" />
            Add label
          </Button>
        </div>
      ) : null}
    </div>
  );
}
