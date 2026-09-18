# Orbit

A collaborative team workspace: teams create projects, break work into tasks, and track progress from
a shared dashboard. Kanban boards with drag and drop, list views, task dependencies, comments,
attachments, labels, in-app notifications, due-date email reminders, member roles and invitations,
and workspace analytics.

Around 9,400 lines of strict TypeScript over fifteen Prisma models. Built on the Next.js App Router,
where all twenty-five mutations are Server Actions — the only HTTP routes in the project are the
Auth.js handler, the file-upload handler, and one cron endpoint.

---

## Architecture

Code is organized by feature, not by technical layer:

```
features/<domain>/
├── actions/     Server Actions — every mutation in the system
├── queries/     server-side reads, called from Server Components
├── components/  the UI for that domain
└── schemas/     Zod schemas, shared by the action and the form
```

`features/` holds `auth`, `workspace`, `project`, `task`, `notification` and `dashboard`. A feature
owns its mutations, its reads and its UI together, so adding a capability means adding a directory
rather than touching five shared layers. `app/` holds only routing and page composition; `lib/` holds
the Prisma client, the Auth.js configuration and the auth helpers.

### The Server Action contract

Every action follows the same sequence, and the consistency is the point — there is one place to
look to know whether an operation is safe:

1. `requireAuth()` — resolve the session or redirect
2. `schema.parse(input)` — Zod validation, with the same schema the form uses
3. load the entity and confirm it exists
4. check the caller's `WorkspaceMember` role
5. mutate, inside `$transaction` when more than one row is involved
6. `revalidatePath(...)` for the affected routes
7. return `{ success: true }` or `{ error: "..." }` — actions do not throw at the caller

Of the twenty-five actions, twenty-three call `requireAuth` (the exceptions are `login` and
`register`), twenty-four validate with Zod (the exception is `markAllRead`, which takes no input),
and twenty check workspace membership before writing.

---

## Decisions worth reading about

**Authorization is re-checked inside every action, not just in middleware.** A Server Action compiles
to a public HTTP endpoint with a generated ID — it is callable directly, not only from the button
that renders it. Middleware that guards `/[workspaceSlug]/...` protects the *page*, not the action,
so a check that lived only there would be bypassable by anyone who could read a network tab. Each
action therefore loads the caller's `WorkspaceMember` row and checks the role itself. It is repetitive
on purpose: the alternative is a single missed wrapper somewhere becoming a privilege escalation.

**Task numbers come from `max(number) + 1`, and the unique constraint is the real guarantee.** Tasks
are addressed the way an issue tracker addresses them — `ORB-42`, scoped per project — which means
allocating a sequential number at insert time. The allocation reads the current maximum and adds one
inside a transaction, but at Postgres' default Read Committed isolation that read takes no lock, so
two concurrent creations in the same project can read the same maximum. What actually prevents a
duplicate is `@@unique([projectId, number])` on the table: the losing transaction hits the constraint
and fails rather than silently producing two `ORB-42`s. The read-then-write is the fast path; the
constraint is the correctness boundary.

**A dependency is rejected before the edge exists, not after.** Task dependencies form a directed
graph, and a cycle there would make "what is blocking this?" non-terminating. `addDependency` walks
the graph with an iterative depth-first search from the would-be blocked task, following `blockingId`
edges, and refuses the insert if it can reach the would-be blocker. The traversal is iterative rather
than recursive so a deep chain cannot blow the stack, and it carries a `visited` set so a diamond
shape is not re-walked. The write itself is an `upsert` on `@@unique([blockingId, blockedId])`, so
adding the same dependency twice is a no-op instead of an error.

**A task, its activity entry and its notification are written in one transaction.** Creating a task
also appends to `ActivityLog` and, when it is assigned to someone else, inserts a `Notification`.
All three happen inside `prisma.$transaction`, so there is no state where a notification points at a
task that failed to persist, and no state where the audit timeline disagrees with the data.

**Due-date reminders are idempotent by a stamped column.** An hourly cron hits `/api/cron/reminders`,
guarded by a bearer secret. The query selects only tasks with `reminderSentAt: null` and stamps the
column after sending, so a retried or double-fired invocation cannot email the same person twice
about the same task — the idempotency lives in the database, not in the scheduler's guarantees.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 — App Router, React Server Components, Server Actions |
| Language | TypeScript (strict) |
| Auth | Auth.js v5 — credentials + Google OAuth |
| Database | PostgreSQL + Prisma 6 |
| UI | shadcn/ui + Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Uploads | UploadThing |
| Email | Resend |
| Drag & drop | dnd-kit |
| Testing | Vitest + Testing Library |
| CI | GitHub Actions |

---

## Running it

Requirements: Node 20+, Docker.

```bash
cp .env.example .env.local
docker compose up -d
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000 and sign in with a seeded account:

| Email | Password | Role |
| --- | --- | --- |
| ada@orbit.test | password123 | Owner |
| grace@orbit.test | password123 | Admin |
| alan@orbit.test | password123 | Member |

Google OAuth, UploadThing and Resend keys are optional in development — see `.env.example`. Without
them the related features stay disabled rather than failing.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |

---

## Limitations

Stated plainly, because they are real:

- **Test coverage is thin for the size of the codebase.** The suite covers the Zod schemas and the
  utility layer; the Server Actions — where the authorization and transaction logic actually lives —
  are not yet covered. That is the first gap worth closing, and it is the one that matters most,
  since those are the paths a bug would be dangerous in.
- **Notifications are not pushed.** They are read from the database on render, so a user sees a new
  notification on their next navigation rather than instantly. Real-time delivery would mean adding a
  transport this project deliberately does not have yet.
- **Reminders have hourly granularity**, bounded by the cron schedule — a task due at 09:05 is
  reminded at 10:00, not at 09:05.
- **`revalidatePath` invalidates at route granularity**, so a small mutation can re-render more of a
  page than strictly changed. It is the simple, correct default; finer-grained caching would be an
  optimization, not a fix.

## License

MIT — see [LICENSE](LICENSE).
