import { redirect } from "next/navigation";
import { Orbit } from "lucide-react";
import { requireAuth } from "@/lib/auth.helpers";
import { getUserWorkspaces } from "@/features/workspace/queries/get-workspaces";
import { CreateWorkspaceForm } from "@/features/workspace/components/CreateWorkspaceForm";

export const metadata = { title: "Get started | Orbit" };

export default async function OnboardingPage() {
  const session = await requireAuth();
  const workspaces = await getUserWorkspaces(session.user.id);
  if (workspaces.length > 0) {
    redirect(`/${workspaces[0].slug}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 flex items-center gap-2 text-xl font-semibold">
        <Orbit className="size-6" />
        Orbit
      </div>
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted-foreground">
            Workspaces keep your team&apos;s projects and tasks in one place.
          </p>
        </div>
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
