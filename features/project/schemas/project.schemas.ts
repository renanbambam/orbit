import { z } from "zod";

export const PROJECT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#14b8a6",
  "#3b82f6",
] as const;

export const projectStatusSchema = z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]);

export const createProjectSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2, "Project name must be at least 2 characters").max(50),
  identifier: z
    .string()
    .min(2, "Identifier must be 2-6 letters")
    .max(6, "Identifier must be 2-6 letters")
    .regex(/^[A-Z]+$/, "Identifier must be uppercase letters only"),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, "Pick a valid color"),
});

export const updateProjectSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(2, "Project name must be at least 2 characters").max(50),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, "Pick a valid color"),
  status: projectStatusSchema,
});

export const archiveProjectSchema = z.object({
  projectId: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ArchiveProjectInput = z.infer<typeof archiveProjectSchema>;
