import Link from "next/link";
import {
  ChartNoAxesCombined,
  KanbanSquare,
  MessageSquare,
  Orbit,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Kanban boards",
    description:
      "Drag tasks across customizable columns and keep work flowing from backlog to done.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    description:
      "Invite your whole team with role-based access. Owners, admins, members, and viewers.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Progress dashboards",
    description:
      "Completion trends, status distribution, and team velocity — always up to date.",
  },
  {
    icon: MessageSquare,
    title: "Comments & activity",
    description:
      "Discuss work where it happens and follow every change in the activity feed.",
  },
  {
    icon: Zap,
    title: "Fast by default",
    description:
      "Optimistic updates and server rendering keep every interaction instant.",
  },
  {
    icon: Orbit,
    title: "Projects that scale",
    description:
      "Break initiatives into projects with their own identifiers, like WEB-42.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 text-lg font-semibold">
          <Orbit className="size-5 text-indigo-400" />
          Orbit
        </span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" className="text-gray-300 hover:bg-gray-800 hover:text-white">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="bg-indigo-500 text-white hover:bg-indigo-400">
            <Link href="/register">Get started</Link>
          </Button>
        </nav>
      </header>
      <main>
        <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 mx-auto h-64 max-w-3xl rounded-full bg-indigo-500/20 blur-3xl" />
          <h1 className="relative mx-auto max-w-3xl bg-gradient-to-b from-white to-gray-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
            Mission control for your team&apos;s work
          </h1>
          <p className="relative mx-auto mt-6 max-w-xl text-lg text-gray-400">
            Orbit brings projects, tasks, and progress tracking into one shared
            workspace — so everyone knows what&apos;s moving and what&apos;s next.
          </p>
          <div className="relative mt-10 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-indigo-500 text-white hover:bg-indigo-400">
              <Link href="/register">Start for free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 transition-colors hover:border-gray-700"
              >
                <feature.icon className="size-6 text-indigo-400" />
                <h2 className="mt-4 font-medium text-white">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="border-t border-gray-800">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Ready to get your team in sync?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-gray-400">
              Create a workspace in seconds. No credit card required.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-indigo-500 text-white hover:bg-indigo-400"
            >
              <Link href="/register">Create your workspace</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Orbit className="size-4" />
            Orbit
          </span>
          <span>Built for teams that ship.</span>
        </div>
      </footer>
    </div>
  );
}
