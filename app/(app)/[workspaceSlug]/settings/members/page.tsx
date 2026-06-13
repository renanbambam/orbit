import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { getWorkspaceMembers } from "@/features/workspace/queries/get-members";
import { InviteMembersDialog } from "@/features/workspace/components/InviteMembersDialog";
import { MembersTable } from "@/features/workspace/components/MembersTable";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Members | Orbit" };

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const session = await requireAuth();
  const workspace = await getWorkspaceBySlug(workspaceSlug, session.user.id);
  if (!workspace) {
    redirect("/onboarding");
  }

  const { members, invites } = await getWorkspaceMembers(workspace.id);
  const canManage = workspace.role === "OWNER" || workspace.role === "ADMIN";

  return (
    <div className="px-6 py-8">
      <PageHeader title="Members" description="People with access to this workspace.">
        {canManage ? <InviteMembersDialog workspaceId={workspace.id} /> : null}
      </PageHeader>
      <MembersTable
        workspaceId={workspace.id}
        members={members}
        invites={invites}
        currentUserId={session.user.id}
        canManage={canManage}
      />
    </div>
  );
}
