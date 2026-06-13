"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/features/task/task.constants";
import type { AssigneeOption } from "@/features/task/components/AssigneePicker";
import type { LabelOption } from "@/features/task/queries/get-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "ALL";

export function TaskFilters({
  members,
  labels,
}: {
  members: AssigneeOption[];
  labels: LabelOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value === ALL) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const hasFilters =
    searchParams.has("status") ||
    searchParams.has("priority") ||
    searchParams.has("assigneeId") ||
    searchParams.has("labelId") ||
    searchParams.has("search");

  return (
    <div className="flex items-center gap-2">
      <Input
        key={searchParams.get("search") ?? ""}
        defaultValue={searchParams.get("search") ?? ""}
        placeholder="Search tasks..."
        className="h-8 w-44"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setFilter("search", event.currentTarget.value.trim() || ALL);
          }
        }}
      />
      <Select value={searchParams.get("status") ?? ALL} onValueChange={(v) => setFilter("status", v)}>
        <SelectTrigger className="h-8 w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {TASK_STATUSES.map((entry) => (
            <SelectItem key={entry.value} value={entry.value}>
              {entry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("priority") ?? ALL}
        onValueChange={(v) => setFilter("priority", v)}
      >
        <SelectTrigger className="h-8 w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {TASK_PRIORITIES.map((entry) => (
            <SelectItem key={entry.value} value={entry.value}>
              {entry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("assigneeId") ?? ALL}
        onValueChange={(v) => setFilter("assigneeId", v)}
      >
        <SelectTrigger className="h-8 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All assignees</SelectItem>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {labels.length > 0 ? (
        <Select value={searchParams.get("labelId") ?? ALL} onValueChange={(v) => setFilter("labelId", v)}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All labels</SelectItem>
            {labels.map((label) => (
              <SelectItem key={label.id} value={label.id}>
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
                  {label.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => router.replace(pathname)}>
          <X className="size-4" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
