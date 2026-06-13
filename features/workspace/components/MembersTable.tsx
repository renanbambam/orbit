"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Member, PendingInvite } from "@/features/workspace/queries/get-members";
import { removeMember } from "@/features/workspace/actions/remove-member.action";
import { updateMemberRole } from "@/features/workspace/actions/update-member-role.action";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MembersTable({
  workspaceId,
  members,
  invites,
  currentUserId,
  canManage,
}: {
  workspaceId: string;
  members: Member[];
  invites: PendingInvite[];
  currentUserId: string;
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(memberId: string, role: "ADMIN" | "MEMBER" | "VIEWER") {
    startTransition(async () => {
      const result = await updateMemberRole({ workspaceId, memberId, role });
      if (result.error) toast.error(result.error);
      else toast.success("Role updated");
    });
  }

  function handleRemove(memberId: string, name: string) {
    startTransition(async () => {
      const result = await removeMember({ workspaceId, memberId });
      if (result.error) toast.error(result.error);
      else toast.success(`${name} removed from workspace`);
    });
  }

  return (
    <div className="space-y-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isSelf = member.user.id === currentUserId;
            const isOwner = member.role === "OWNER";
            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={member.user.name} image={member.user.image} />
                    <div>
                      <p className="font-medium">
                        {member.user.name}
                        {isSelf ? <span className="ml-1 text-muted-foreground">(you)</span> : null}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canManage && !isOwner && !isSelf ? (
                    <Select
                      value={member.role}
                      onValueChange={(role) =>
                        handleRoleChange(member.id, role as "ADMIN" | "MEMBER" | "VIEWER")
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">{member.role.toLowerCase()}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {canManage && !isOwner && !isSelf ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(member.id, member.user.name)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {invites.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Pending invitations</h3>
          <Table>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invite.role.toLowerCase()}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
