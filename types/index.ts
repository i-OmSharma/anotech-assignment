import { Role, Status, Priority } from "@prisma/client"

export type { Role, Status, Priority }

export interface UserSummary {
  id: string
  name: string
  email: string
  role: Role
}

export interface TaskWithUsers {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  dueDate: string | null
  createdById: string
  assignedToId: string | null
  createdBy: UserSummary
  assignedTo: UserSummary | null
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface TaskFilters {
  status?: string[]
  priority?: string[]
  assignedToId?: string
  search?: string
  myTasks?: boolean
  dueBefore?: string
  dueAfter?: string
}

export interface DashboardStats {
  total: number
  todo: number
  inProgress: number
  done: number
  overdue: number
  completionRate: number
  recentTasks: TaskWithUsers[]
}
