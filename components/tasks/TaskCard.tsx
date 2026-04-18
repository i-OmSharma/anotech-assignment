"use client"

import { useState } from "react"
import { CalendarDays, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TaskWithUsers } from "@/types"
import { cn, formatDate, isOverdue, getInitials } from "@/lib/utils"
import { TaskFormModal } from "./TaskForm"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"

const statusConfig = {
  TODO: { label: "To Do", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
  DONE: { label: "Done", dot: "bg-green-500", chip: "bg-green-100 text-green-700" },
}

const priorityConfig = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-600 border-gray-200" },
  MEDIUM: { label: "Med", className: "bg-amber-100 text-amber-700 border-amber-200" },
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
  const status = statusConfig[task.status]
  const canDelete = task.createdById === currentUserId || currentUserRole === "ADMIN"

  return (
    <>
      <div
        className={cn(
          "bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all space-y-3 group",
          overdue && "border-l-[3px] border-l-red-500"
        )}
        onClick={() => setEditOpen(true)}
      >
        {/* Top row: status + priority + delete */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full", status.chip)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          <div className="flex items-center gap-1">
            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", priority.className)}>
              {priority.label}
            </span>
            {canDelete && (
              <div onClick={(e) => e.stopPropagation()}>
                <DeleteConfirmDialog taskId={task.id} taskTitle={task.title} />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        {/* Bottom row: due date + assignee */}
        <div className="flex items-center justify-between pt-1">
          {task.dueDate ? (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              overdue ? "text-red-600 font-medium" : "text-gray-500"
            )}>
              {overdue ? <AlertCircle className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
              <span>{formatDate(task.dueDate)}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No due date</span>
          )}

          {task.assignedTo && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                {getInitials(task.assignedTo.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
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
