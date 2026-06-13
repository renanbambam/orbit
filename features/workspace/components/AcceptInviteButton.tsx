"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/features/workspace/actions/accept-invite.action";
import { Button } from "@/components/ui/button";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvite({ token });
      if ("slug" in result) {
        router.push(`/${result.slug}`);
        return;
      }
      setError(result.error ?? "Something went wrong");
    });
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={handleAccept} disabled={isPending}>
        {isPending ? "Joining..." : "Accept invitation"}
      </Button>
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
