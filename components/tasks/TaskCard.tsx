"use client"

import { useState } from "react"
import { CalendarDays, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { TaskWithUsers } from "@/types"
import { cn, formatDate, isOverdue, getInitials } from "@/lib/utils"
import { TaskFormModal } from "./TaskForm"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"

const priorityConfig = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-700 border-gray-200" },
  MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  HIGH: { label: "High", className: "bg-red-100 text-red-700 border-red-200" },
}

interface TaskCardProps {
  task: TaskWithUsers
  currentUserId: string
  currentUserRole: string
}

export function TaskCard({ task, currentUserId, currentUserRole }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const overdue = isOverdue(task.dueDate) && task.status !== "DONE"
  const priority = priorityConfig[task.priority]
  const canDelete = task.createdById === currentUserId || currentUserRole === "ADMIN"

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow border",
          overdue && "border-l-4 border-l-red-500"
        )}
        onClick={() => setEditOpen(true)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-tight line-clamp-2">{task.title}</h3>
            <Badge variant="outline" className={cn("text-xs shrink-0", priority.className)}>
              {priority.label}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                  )}
                >
                  {overdue && <AlertCircle className="h-3 w-3" />}
                  <CalendarDays className="h-3 w-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {task.assignedTo && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {getInitials(task.assignedTo.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              {canDelete && (
                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteConfirmDialog taskId={task.id} taskTitle={task.title} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        currentUserRole={currentUserRole}
      />
    </>
  )
}
