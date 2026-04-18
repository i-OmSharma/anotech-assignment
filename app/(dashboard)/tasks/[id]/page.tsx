import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatDate, isOverdue } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronLeft, Calendar, User, Flag } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

const priorityConfig = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-700" },
  MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-700" },
  HIGH: { label: "High", className: "bg-red-100 text-red-700" },
}

const statusConfig = {
  TODO: { label: "To Do", className: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  DONE: { label: "Done", className: "bg-green-100 text-green-700" },
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await auth()
  const { id } = await params

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  })

  if (!task) notFound()

  const overdue = isOverdue(task.dueDate) && task.status !== "DONE"
  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/tasks" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to tasks
        </Link>
      </div>

      <Card className={cn(overdue && "border-l-4 border-l-red-500")}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-xl">{task.title}</CardTitle>
            <div className="flex gap-2 shrink-0">
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
              <Badge variant="outline" className={priority.className}>
                {priority.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <p className="text-muted-foreground">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created by:</span>
              <span className="font-medium">{task.createdBy.name}</span>
            </div>

            {task.assignedTo && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned to:</span>
                <span className="font-medium">{task.assignedTo.name}</span>
              </div>
            )}

            {task.dueDate && (
              <div className={cn("flex items-center gap-2 text-sm", overdue && "text-red-600")}>
                <Calendar className="h-4 w-4" />
                <span className="text-muted-foreground">Due:</span>
                <span className={cn("font-medium", overdue && "text-red-600")}>
                  {formatDate(task.dueDate)}
                  {overdue && " (Overdue)"}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{formatDate(task.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
