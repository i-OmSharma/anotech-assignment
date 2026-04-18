"use client"

import { TaskWithUsers } from "@/types"
import { TaskCard } from "./TaskCard"
import { Skeleton } from "@/components/ui/skeleton"

const columns = [
  {
    id: "TODO",
    label: "To Do",
    dot: "bg-slate-400",
    header: "bg-slate-50 border-slate-200",
    count: "bg-slate-200 text-slate-700",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    dot: "bg-blue-500",
    header: "bg-blue-50 border-blue-200",
    count: "bg-blue-200 text-blue-700",
  },
  {
    id: "DONE",
    label: "Done",
    dot: "bg-green-500",
    header: "bg-green-50 border-green-200",
    count: "bg-green-200 text-green-700",
  },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => (
          <div key={col.id} className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        return (
          <div key={col.id} className="flex flex-col gap-3">
            {/* Column header */}
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${col.header}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-gray-800">{col.label}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.count}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3 min-h-[180px]">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-xs text-gray-400 font-medium">No tasks</p>
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
