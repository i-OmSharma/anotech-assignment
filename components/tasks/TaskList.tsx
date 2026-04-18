"use client"

import { useState } from "react"
import { TaskWithUsers } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, isOverdue } from "@/lib/utils"
import { TaskFormModal } from "./TaskForm"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"

const statusConfig = {
  TODO: { label: "To Do", className: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  DONE: { label: "Done", className: "bg-green-100 text-green-700" },
}

const priorityConfig = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-700" },
  MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-700" },
  HIGH: { label: "High", className: "bg-red-100 text-red-700" },
}

interface TaskRowProps {
  task: TaskWithUsers
  currentUserId: string
  currentUserRole: string
}

function TaskRow({ task, currentUserId, currentUserRole }: TaskRowProps) {
  const [editOpen, setEditOpen] = useState(false)
  const overdue = isOverdue(task.dueDate) && task.status !== "DONE"
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const canDelete = task.createdById === currentUserId || currentUserRole === "ADMIN"

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors",
          overdue && "border-l-4 border-l-red-500"
        )}
        onClick={() => setEditOpen(true)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        <Badge variant="outline" className={cn("text-xs shrink-0", status.className)}>
          {status.label}
        </Badge>

        <Badge variant="outline" className={cn("text-xs shrink-0", priority.className)}>
          {priority.label}
        </Badge>

        {task.dueDate && (
          <span
            className={cn(
              "text-xs shrink-0",
              overdue ? "text-red-600 font-medium" : "text-muted-foreground"
            )}
          >
            {formatDate(task.dueDate)}
          </span>
        )}

        {canDelete && (
          <div onClick={(e) => e.stopPropagation()}>
            <DeleteConfirmDialog taskId={task.id} taskTitle={task.title} />
          </div>
        )}
      </div>

      <TaskFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        currentUserRole={currentUserRole}
      />
    </>
  )
}

interface TaskListProps {
  tasks: TaskWithUsers[]
  isLoading: boolean
  currentUserId: string
  currentUserRole: string
}

export function TaskList({
  tasks,
  isLoading,
  currentUserId,
  currentUserRole,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium mb-1">No tasks found</h3>
        <p className="text-muted-foreground text-sm">
          Adjust your filters or create a new task to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg divide-y overflow-hidden bg-white">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  )
}
