import type { ReactNode } from "react";
import { requireAuth } from "@/lib/auth.helpers";
import { SessionProvider } from "@/components/providers/SessionProvider";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
