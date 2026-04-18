import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CheckSquare, Clock, AlertCircle, ListTodo, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, isOverdue, cn } from "@/lib/utils"


export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id
  const isAdmin = session!.user.role === "ADMIN"

  const whereClause = isAdmin
    ? {}
    : { OR: [{ createdById: userId }, { assignedToId: userId }] }

  const now = new Date()

  // Single query for all tasks + recent 5 in parallel
  const [allTasks, recentTasks] = await Promise.all([
    prisma.task.findMany({
      where: whereClause,
      select: { status: true, dueDate: true },
    }),
    prisma.task.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        updatedAt: true,
      },
    }),
  ])

  const total = allTasks.length
  const todo = allTasks.filter((t) => t.status === "TODO").length
  const inProgress = allTasks.filter((t) => t.status === "IN_PROGRESS").length
  const done = allTasks.filter((t) => t.status === "DONE").length
  const overdue = allTasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== "DONE"
  ).length
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

  const stats = [
    { label: "Total", value: total, icon: ListTodo, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "To Do", value: todo, icon: Clock, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "In Progress", value: inProgress, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Done", value: done, icon: CheckSquare, color: "text-green-600", bg: "bg-green-50" },
    { label: "Overdue", value: overdue, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ]

  const statusConfig = {
    TODO: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DONE: "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Welcome back, {session!.user.name}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", stat.bg)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Completion progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Completion Rate</h2>
          <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{done} of {total} tasks completed</p>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
        </div>
        {recentTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">No tasks yet.</p>
            <Link href="/tasks" className="text-indigo-600 hover:underline text-sm mt-1 inline-block font-medium">
              Create your first task →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTasks.map((task) => {
              const overdueTask = isOverdue(task.dueDate) && task.status !== "DONE"
              return (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className={cn(
                    "flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors",
                    overdueTask && "border-l-[3px] border-l-red-500"
                  )}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Updated {formatDate(task.updatedAt)}
                      </p>
                    </div>
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium ml-4 shrink-0", statusConfig[task.status])}>
                      {task.status === "IN_PROGRESS" ? "In Progress" : task.status === "TODO" ? "To Do" : "Done"}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
