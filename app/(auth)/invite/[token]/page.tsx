import Link from "next/link";
import { getSession } from "@/features/auth/queries/get-session";
import { getInvite } from "@/features/workspace/queries/get-invite";
import { AcceptInviteButton } from "@/features/workspace/components/AcceptInviteButton";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Invitation | Orbit" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInvite(token);

  if (!invite) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invitation expired</h1>
        <p className="text-sm text-muted-foreground">
          This invitation is no longer valid. Ask a workspace admin to send a new one.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  const session = await getSession();

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Join {invite.workspaceName}</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ve been invited to collaborate on Orbit.
        </p>
      </div>
      {session?.user ? (
        <AcceptInviteButton token={token} />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Sign in or create an account to accept.</p>
          <Button asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
