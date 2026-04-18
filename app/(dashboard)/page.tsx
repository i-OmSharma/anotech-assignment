import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CheckSquare, Clock, AlertCircle, ListTodo, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, isOverdue, cn } from "@/lib/utils"
import { Prisma } from "@prisma/client"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id
  const isAdmin = session!.user.role === "ADMIN"

  const whereClause: Prisma.TaskWhereInput = isAdmin
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {session!.user.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completion rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground w-12 shrink-0">
              {completionRate}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {done} of {total} tasks completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No tasks yet.</p>
              <Link href="/tasks" className="text-primary hover:underline text-sm mt-2 inline-block">
                Create your first task
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const overdueTask = isOverdue(task.dueDate) && task.status !== "DONE"
                return (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className={cn(
                      "flex items-center justify-between py-2 border-b last:border-0 hover:bg-gray-50 px-2 rounded transition-colors",
                      overdueTask && "border-l-2 border-l-red-500 pl-3"
                    )}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDate(task.updatedAt)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-xs ml-4 shrink-0", statusConfig[task.status])}
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
