"use client";

import { useParams } from "next/navigation";

export function useWorkspace() {
  const params = useParams<{ workspaceSlug?: string; projectIdentifier?: string }>();
  return {
    workspaceSlug: params.workspaceSlug ?? null,
    projectIdentifier: params.projectIdentifier ?? null,
  };
}
