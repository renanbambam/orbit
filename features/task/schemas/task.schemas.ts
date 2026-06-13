import { z } from "zod";

export const taskStatusSchema = z.enum([
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED",
]);

export const taskPrioritySchema = z.enum([
  "NO_PRIORITY",
  "URGENT",
  "HIGH",
  "MEDIUM",
  "LOW",
]);

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(10000).optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assigneeId: z.string().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200).optional(),
  description: z.string().max(10000).nullable().optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.date().nullable().optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: taskStatusSchema,
});

export const deleteTaskSchema = z.object({
  taskId: z.string().min(1),
});

export const addCommentSchema = z.object({
  taskId: z.string().min(1),
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const deleteCommentSchema = z.object({
  commentId: z.string().min(1),
});

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().optional(),
  labelId: z.string().optional(),
  search: z.string().max(200).optional(),
});

export const createLabelSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "Label name is required").max(30),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, "Pick a valid color"),
});

export const deleteLabelSchema = z.object({
  labelId: z.string().min(1),
});

export const toggleTaskLabelSchema = z.object({
  taskId: z.string().min(1),
  labelId: z.string().min(1),
});

export const addDependencySchema = z.object({
  taskId: z.string().min(1),
  blockedByTaskId: z.string().min(1),
});

export const removeDependencySchema = z.object({
  dependencyId: z.string().min(1),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type DeleteLabelInput = z.infer<typeof deleteLabelSchema>;
export type ToggleTaskLabelInput = z.infer<typeof toggleTaskLabelSchema>;
export type AddDependencyInput = z.infer<typeof addDependencySchema>;
export type RemoveDependencyInput = z.infer<typeof removeDependencySchema>;
