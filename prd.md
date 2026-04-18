# PRD — Team Task Management System
**Anotech India Solutions | SDE-1 Assignment**

---

## 1. Project Overview

A full-stack Task Management SPA where authenticated users can create, assign, filter, and track tasks — individually or in teams. Think stripped-down Linear/Trello.

---

## 2. Tech Stack (Decisions Pre-Made)

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | Required |
| Styling | Tailwind CSS + shadcn/ui | Required |
| Backend | Next.js Route Handlers (API Routes) | No separate Express server — simpler mono-repo |
| Database | PostgreSQL via Prisma ORM | Type-safe, great DX |
| Auth | NextAuth.js v5 (credentials provider) | JWT-based, integrates natively |
| Deployment | Vercel | Required |
| State | Zustand (client) + React Query (server) | Avoids prop drilling and re-renders |

---

## 3. Database Schema

```
User
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  password    String   (bcrypt hashed)
  role        Role     @default(MEMBER)  // ADMIN | MEMBER
  tasks       Task[]   @relation("AssignedTasks")
  createdAt   DateTime @default(now())

Task
  id          String   @id @default(cuid())
  title       String
  description String?
  status      Status   @default(TODO)   // TODO | IN_PROGRESS | DONE
  priority    Priority @default(MEDIUM) // LOW | MEDIUM | HIGH
  dueDate     DateTime?
  createdById String
  assignedToId String?
  createdBy   User     @relation("CreatedTasks", fields: [createdById])
  assignedTo  User?    @relation("AssignedTasks", fields: [assignedToId])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
```

---

## 4. Features

### 4.1 Auth (Required)
- Register with name, email, password
- Login → JWT session via NextAuth
- Logout
- Protected routes via middleware.ts
- Role: ADMIN can assign tasks to others; MEMBER manages own tasks

### 4.2 Task CRUD (Required)
| Action | Detail |
|---|---|
| Create | Title (required), description, status, priority, due date, assign to user |
| Read | Kanban board (3 columns by status) + list view toggle |
| Update | Inline edit or modal — all fields editable |
| Delete | With confirmation dialog |

### 4.3 Filters + Search (Required for evaluation)
- Filter by: status, priority, assignee, due date range
- Search by title/description (debounced input)
- URL-synced filters (shareable links)

### 4.4 Dashboard
- Stats: total tasks, overdue count, completion rate
- "My Tasks" vs "All Tasks" toggle (ADMIN sees all)

---

## 5. Folder Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx         ← protected layout
│   │   ├── page.tsx           ← dashboard/stats
│   │   └── tasks/
│   │       ├── page.tsx       ← kanban + list view
│   │       └── [id]/page.tsx  ← task detail
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── tasks/
│           ├── route.ts       ← GET all, POST create
│           └── [id]/route.ts  ← GET one, PUT update, DELETE
├── components/
│   ├── ui/                    ← shadcn primitives
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskFilters.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── prisma.ts              ← singleton client
│   ├── auth.ts                ← NextAuth config
│   └── validations.ts         ← Zod schemas
├── hooks/
│   ├── useTasks.ts            ← React Query hooks
│   └── useTaskFilters.ts
├── types/
│   └── index.ts
├── prisma/
│   └── schema.prisma
└── middleware.ts              ← route protection
```

---

## 6. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ✗ | Create account |
| POST | /api/auth/[...nextauth] | ✗ | Login/logout |
| GET | /api/tasks | ✓ | List tasks (with query params: status, priority, search, assignee) |
| POST | /api/tasks | ✓ | Create task |
| GET | /api/tasks/[id] | ✓ | Get single task |
| PUT | /api/tasks/[id] | ✓ | Update task |
| DELETE | /api/tasks/[id] | ✓ | Delete task (own or ADMIN) |
| GET | /api/users | ✓ ADMIN | List users for assignment dropdown |

---

## 7. Validation Rules (Zod)

```ts
TaskSchema = {
  title: string().min(3).max(100),
  description: string().max(500).optional(),
  status: enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: date().min(today).optional(),
  assignedToId: cuid().optional()
}
```

---

## 8. UI/UX Decisions

- **Kanban board** is default view; list view as toggle
- Task cards show: title, priority badge (colored), assignee avatar, due date, status chip
- Overdue tasks highlighted in red
- Empty states with CTA (e.g., "No tasks yet — create one")
- Toast notifications for all CRUD actions
- Skeleton loaders (not spinners)
- Mobile responsive — sidebar collapses to bottom nav on mobile

---

## 9. Performance Rules

- Server Components for all data-fetch routes (no client-side fetching on initial load)
- Client Components only for interactive parts (forms, filters, kanban drag)
- React Query for mutation + cache invalidation
- Debounce search input (300ms)
- `loading.tsx` and `error.tsx` per route segment

---

## 10. Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT secret in `.env` — never exposed to client
- All API routes validate session before executing
- Zod validation on every API input
- SQL injection impossible via Prisma parameterized queries
- Users can only delete/edit their own tasks unless ADMIN

---

## 11. Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

---

## 12. Out of Scope (deliberately excluded to keep it clean)

- Real-time updates (WebSockets)
- File attachments
- Comments on tasks
- Email notifications
- OAuth (Google/GitHub login)

---

## 13. README Must Include

- Project overview
- Tech stack with reasons
- Setup steps (clone → env → db → run)
- Features implemented
- Key architectural decisions
- Live URL + GitHub link