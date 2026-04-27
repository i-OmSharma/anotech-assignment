"use client"

import { useState } from "react"
import { CalendarDays, AlertCircle, ClipboardList, ChevronDown } from "lucide-react"
import { TaskWithUsers } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatDate, isOverdue, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TaskFormModal } from "./TaskForm"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useUpdateTask } from "@/hooks/useTasks"

const statusConfig = {
  TODO: { label: "To Do", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
  DONE: { label: "Done", dot: "bg-green-500", chip: "bg-green-100 text-green-700" },
}

const priorityConfig = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-600 border-gray-200" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200" },
  HIGH: { label: "High", className: "bg-red-100 text-red-700 border-red-200" },
}

interface TaskRowProps {
  task: TaskWithUsers
  currentUserId: string
  currentUserRole: string
}

function TaskRow({ task, currentUserId, currentUserRole }: TaskRowProps) {
  const [editOpen, setEditOpen] = useState(false)
  const updateTask = useUpdateTask()
  const overdue = isOverdue(task.dueDate) && task.status !== "DONE"
  const status = statusConfig[task.status]
  const priority = priorityConfig[task.priority]
  const canDelete = task.createdById === currentUserId || currentUserRole === "ADMIN"

  function changeStatus(newStatus: keyof typeof statusConfig) {
    if (newStatus !== task.status) {
      updateTask.mutate({ id: task.id, data: { status: newStatus } })
    }
  }

  function changePriority(newPriority: keyof typeof priorityConfig) {
    if (newPriority !== task.priority) {
      updateTask.mutate({ id: task.id, data: { priority: newPriority } })
    }
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors",
          overdue && "border-l-[3px] border-l-red-500"
        )}
        onClick={() => setEditOpen(true)}
      >
        {/* Title + description */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{task.description}</p>
          )}
        </div>

        {/* Status chip — inline dropdown */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80 transition-opacity", status.chip)}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", status.dot)} />
              {status.label}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(statusConfig) as (keyof typeof statusConfig)[]).map((s) => (
                <DropdownMenuItem key={s} onClick={() => changeStatus(s)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full mr-2", statusConfig[s].dot)} />
                  {statusConfig[s].label}
                  {task.status === s && <span className="ml-auto text-indigo-600">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority — inline dropdown */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn("text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap shrink-0 cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-1", priority.className)}
            >
              {priority.label}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(Object.keys(priorityConfig) as (keyof typeof priorityConfig)[]).map((p) => (
                <DropdownMenuItem key={p} onClick={() => changePriority(p)}>
                  {priorityConfig[p].label}
                  {task.priority === p && <span className="ml-auto text-indigo-600">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Due date */}
        <div className={cn(
          "flex items-center gap-1 text-xs shrink-0 whitespace-nowrap",
          task.dueDate ? (overdue ? "text-red-600 font-medium" : "text-gray-500") : "text-gray-300"
        )}>
          {task.dueDate ? (
            <>
              {overdue ? <AlertCircle className="h-3 w-3" /> : <CalendarDays className="h-3 w-3" />}
              {formatDate(task.dueDate)}
            </>
          ) : (
            <span>—</span>
          )}
        </div>

        {/* Assignee + delete */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {task.assignedTo && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-semibold">
                {getInitials(task.assignedTo.name)}
              </AvatarFallback>
            </Avatar>
          )}
          {canDelete && <DeleteConfirmDialog taskId={task.id} taskTitle={task.title} />}
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
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-xl">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ClipboardList className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">No tasks found</h3>
        <p className="text-xs text-gray-500 max-w-xs">
          Adjust your filters or create a new task to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</span>
      </div>
      <div className="divide-y divide-gray-100">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        ))}
      </div>
    </div>
  )
}
