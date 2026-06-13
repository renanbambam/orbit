import type { ReactNode } from "react";
import Link from "next/link";
import { Orbit } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-semibold">
        <Orbit className="size-6" />
        Orbit
      </Link>
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">{children}</div>
    </div>
  );
}
