"use client"

import { useState, useEffect } from "react"
import { Plus, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanBoard } from "@/components/tasks/KanbanBoard"
import { TaskList } from "@/components/tasks/TaskList"
import { TaskFiltersBar } from "@/components/tasks/TaskFilters"
import { TaskFormModal } from "@/components/tasks/TaskForm"
import { useTasks } from "@/hooks/useTasks"
import { useTaskFilters } from "@/hooks/useTaskFilters"

const VIEW_KEY = "taskflow_view"

interface TasksPageClientProps {
  currentUserId: string
  currentUserRole: string
}

export function TasksPageClient({
  currentUserId,
  currentUserRole,
}: TasksPageClientProps) {
  const [filters, setFilters] = useTaskFilters()
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY)
    if (saved === "list" || saved === "kanban") setView(saved)
  }, [])

  function toggleView(v: "kanban" | "list") {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const { data: tasks = [], isLoading } = useTasks(filters)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isLoading ? "Loading..." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            <button
              className={`p-2 transition-colors ${view === "kanban" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              onClick={() => toggleView("kanban")}
              title="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={`p-2 transition-colors ${view === "list" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              onClick={() => toggleView("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Task
          </Button>
        </div>
      </div>

      <TaskFiltersBar
        filters={filters}
        setFilters={setFilters}
        currentUserRole={currentUserRole}
        showMyTasks={currentUserRole === "ADMIN"}
      />

      {view === "kanban" ? (
        <KanbanBoard
          tasks={tasks}
          isLoading={isLoading}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      ) : (
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}

      <TaskFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        currentUserRole={currentUserRole}
      />
    </div>
  )
}
