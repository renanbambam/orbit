import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { WorkspaceSettingsForm } from "@/features/workspace/components/WorkspaceSettingsForm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Workspace settings | Orbit" };

export default async function WorkspaceSettingsPage({
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

  const canEdit = workspace.role === "OWNER" || workspace.role === "ADMIN";

  return (
    <div className="px-6 py-8">
      <PageHeader title="Workspace settings" description="Manage your workspace details and plan.">
        <Button asChild variant="outline">
          <Link href={`/${workspace.slug}/settings/billing`}>
            <CreditCard className="size-4" />
            Billing
          </Link>
        </Button>
      </PageHeader>
      <WorkspaceSettingsForm
        workspaceId={workspace.id}
        name={workspace.name}
        canEdit={canEdit}
      />
    </div>
  );
}
