# Orbit

Collaborative team workspace where teams create projects, break work into tasks, and track progress from a shared dashboard. Includes kanban boards with drag and drop, list views, task comments and attachments, labels, task dependencies, in-app notifications, due-date email reminders, member roles and invitations, and workspace analytics.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
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

## Quick start

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

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |

## Environment

See `.env.example` for the full list. Google OAuth, UploadThing, and Resend keys are optional in development — the related features simply stay disabled without them.

## Screenshots

_Coming soon._

- Dashboard
- Kanban board
- Task detail
