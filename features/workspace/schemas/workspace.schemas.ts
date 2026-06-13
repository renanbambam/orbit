import { z } from "zod";

export const workspaceRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]);
export const assignableRoleSchema = z.enum(["ADMIN", "MEMBER", "VIEWER"]);

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
});

export const updateWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
  logoUrl: z.url().nullable().optional(),
});

export const inviteMemberSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.email("Enter a valid email address"),
  role: assignableRoleSchema,
});

export const removeMemberSchema = z.object({
  workspaceId: z.string().min(1),
  memberId: z.string().min(1),
});

export const updateMemberRoleSchema = z.object({
  workspaceId: z.string().min(1),
  memberId: z.string().min(1),
  role: assignableRoleSchema,
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
