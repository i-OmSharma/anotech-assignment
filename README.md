# TaskFlow — Team Task Management System

## Project Overview

TaskFlow is a full-stack team task management application built as an SDE-1 assignment for Anotech India Solutions. It lets authenticated users create, assign, filter, and track tasks across a team — think stripped-down Linear/Trello. Admins can assign tasks to team members and see all tasks; members manage their own work.

## Live Demo

[Deployed URL — add after Vercel deployment]

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Server Components, nested layouts, built-in API routes |
| Styling | Tailwind CSS + shadcn/ui (Base UI) | Utility-first CSS, accessible primitives, no runtime overhead |
| Database | PostgreSQL + Prisma ORM | Type-safe queries, migrations, great DX |
| Auth | NextAuth.js v5 (credentials + JWT) | Native Next.js integration, no separate auth server |
| Server state | TanStack Query v5 | Caching, optimistic updates, background refetch |
| Client state | Zustand | Lightweight, no boilerplate |
| Validation | Zod | Shared schemas between client and server |
| Deployment | Vercel | Zero-config Next.js hosting |

## Getting Started

```bash
# 1. Clone the repo
git clone <repo-url>
cd taskflow

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — set DATABASE_URL and NEXTAUTH_SECRET

# 4. Generate NEXTAUTH_SECRET
openssl rand -base64 32

# 5. Run database migration
npx prisma migrate dev --name init

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register an account to get started.

**To create an ADMIN user**, register normally, then run:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Features

- **Authentication**: Register / login with email + password (bcrypt, 12 rounds). JWT sessions via NextAuth.
- **Protected routes**: Middleware redirects unauthenticated users to `/login`.
- **Role-based access**: ADMIN sees all tasks and can assign to team members. MEMBER sees own + assigned tasks.
- **Task CRUD**: Create, read, update, delete tasks with title, description, status, priority, due date, and assignee.
- **Kanban board**: 3 columns (To Do / In Progress / Done) with task counts. Default view.
- **List view**: Compact table-style view. Toggle persisted to localStorage.
- **Filters**: Status chips, priority chips, assignee dropdown, due date range pickers. URL-synced (shareable links).
- **Search**: Debounced (300ms) full-text search on title and description.
- **My Tasks / All Tasks toggle**: ADMIN can switch between all tasks and personal tasks.
- **Overdue highlighting**: Red left border on cards/rows when due date has passed.
- **Optimistic updates**: Status changes update the UI instantly, roll back on error.
- **Toast notifications**: Success and error toasts for all mutations (Sonner).
- **Skeleton loaders**: All loading states use Skeleton components.
- **Dashboard**: Stats cards (total, todo, in-progress, done, overdue), completion progress bar, recent activity feed.
- **Mobile responsive**: Sidebar collapses to bottom navigation bar on screens < 768px.

## Key Decisions

**App Router over Pages Router** — Server Components reduce client JS bundle. Data fetching in layout/page components avoids client-side waterfall for initial load. Nested layouts cleanly separate auth and dashboard.

**Prisma over raw SQL** — Generated TypeScript types from schema means refactors are caught at compile time. Migrations are version-controlled. The Prisma adapter pattern (v7) works well with serverless edge environments.

**NextAuth v5** — Native integration with Next.js middleware and Server Components via the `auth()` helper. JWT strategy avoids a session store. Credentials provider keeps auth self-hosted.

**React Query for server state** — Caching and cache invalidation are handled automatically. Optimistic updates (instant UI response on drag/edit) improve perceived performance without complex state management.

**Zod shared validation** — One schema validates both the API request body (server) and the form inputs (client via react-hook-form resolver). No duplication, consistent error messages.

**Base UI (shadcn nova style)** — Uses `render` prop pattern instead of Radix `asChild`, better accessibility defaults, animation built-in. Components are copy-pasted into the repo so they're fully customizable.

## Author

- **Name**: [Your Name]
- **GitHub**: [github.com/username]
- **LinkedIn**: [linkedin.com/in/username]
