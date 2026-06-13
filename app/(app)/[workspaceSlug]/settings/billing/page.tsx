import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { requireAuth } from "@/lib/auth.helpers";
import { getWorkspaceBySlug } from "@/features/workspace/queries/get-workspace";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Billing | Orbit" };

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: "$0",
    features: ["Up to 5 members", "2 projects", "Basic dashboard"],
  },
  {
    key: "PRO",
    name: "Pro",
    price: "$12",
    features: ["Unlimited members", "Unlimited projects", "Advanced analytics", "File attachments"],
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    features: ["Everything in Pro", "SSO & audit logs", "Dedicated support", "Custom contracts"],
  },
] as const;

export default async function BillingPage({
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

  return (
    <div className="px-6 py-8">
      <PageHeader title="Billing" description="Your current plan and upgrade options." />
      <div className="grid max-w-4xl gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === workspace.plan;
          return (
            <div
              key={plan.key}
              className={cn("rounded-xl border p-6", isCurrent && "border-primary shadow-sm")}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{plan.name}</h2>
                {isCurrent ? <Badge>Current plan</Badge> : null}
              </div>
              <p className="mt-2 text-3xl font-semibold">
                {plan.price}
                {plan.key !== "ENTERPRISE" ? (
                  <span className="text-sm font-normal text-muted-foreground"> /user/mo</span>
                ) : null}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="size-4 text-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
              {!isCurrent ? (
                <Button variant="outline" className="mt-6 w-full" disabled>
                  Coming soon
                </Button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
