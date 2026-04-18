"use client"

import { TaskWithUsers } from "@/types"
import { TaskCard } from "./TaskCard"
import { Skeleton } from "@/components/ui/skeleton"

const columns = [
  { id: "TODO", label: "To Do", color: "bg-slate-100 border-slate-300 text-slate-700" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 border-blue-300 text-blue-700" },
  { id: "DONE", label: "Done", color: "bg-green-100 border-green-300 text-green-700" },
] as const

interface KanbanBoardProps {
  tasks: TaskWithUsers[]
  isLoading: boolean
  currentUserId: string
  currentUserRole: string
}

export function KanbanBoard({
  tasks,
  isLoading,
  currentUserId,
  currentUserRole,
}: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.id} className="space-y-3">
            <Skeleton className="h-8 w-32" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        return (
          <div key={col.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${col.color}`}>
                <span>{col.label}</span>
                <span className="ml-1 bg-white bg-opacity-60 rounded-full px-1.5 py-0.5 text-xs">
                  {colTasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {colTasks.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm text-muted-foreground">No tasks</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
