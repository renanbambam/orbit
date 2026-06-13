import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/queries/get-session";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Sign in | Orbit" };

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your workspace</p>
      </div>
      <LoginForm />
    </div>
  );
}
