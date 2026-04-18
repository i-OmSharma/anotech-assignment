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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => toggleView("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => toggleView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New task
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
