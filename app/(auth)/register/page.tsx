import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/queries/get-session";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata = { title: "Create account | Orbit" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/onboarding");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start collaborating with your team</p>
      </div>
      <RegisterForm />
    </div>
  );
}
