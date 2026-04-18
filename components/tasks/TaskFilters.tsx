"use client"

import { useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskFilters } from "@/types"
import { UserSummary, ApiResponse } from "@/types"
import { useDebounce } from "@/hooks/useDebounce"

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
]

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
]

interface TaskFiltersProps {
  filters: TaskFilters
  setFilters: (f: Partial<TaskFilters>) => void
  currentUserRole: string
  showMyTasks?: boolean
}

async function fetchUsers(): Promise<UserSummary[]> {
  const res = await fetch("/api/users")
  const json: ApiResponse<UserSummary[]> = await res.json()
  return json.data ?? []
}

export function TaskFiltersBar({
  filters,
  setFilters,
  currentUserRole,
  showMyTasks = true,
}: TaskFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "")

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: currentUserRole === "ADMIN",
  })

  const debouncedSearch = useDebounce((value: string) => {
    setFilters({ search: value || undefined })
  }, 300)

  const handleSearch = useCallback(
    (value: string) => {
      setSearchInput(value)
      debouncedSearch(value)
    },
    [debouncedSearch]
  )

  function toggleStatus(status: string) {
    const current = filters.status ?? []
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status]
    setFilters({ status: next })
  }

  function togglePriority(priority: string) {
    const current = filters.priority ?? []
    const next = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority]
    setFilters({ priority: next })
  }

  function clearAll() {
    setSearchInput("")
    setFilters({
      status: [],
      priority: [],
      assignedToId: undefined,
      search: undefined,
      myTasks: false,
      dueBefore: undefined,
      dueAfter: undefined,
    })
  }

  const hasActiveFilters =
    (filters.status?.length ?? 0) > 0 ||
    (filters.priority?.length ?? 0) > 0 ||
    filters.assignedToId ||
    filters.search ||
    filters.myTasks

  const statusStyles: Record<string, { active: string; inactive: string }> = {
    TODO: { active: "bg-slate-700 text-white border-slate-700", inactive: "bg-white text-slate-600 border-slate-300 hover:border-slate-500" },
    IN_PROGRESS: { active: "bg-blue-600 text-white border-blue-600", inactive: "bg-white text-blue-600 border-blue-300 hover:border-blue-500" },
    DONE: { active: "bg-green-600 text-white border-green-600", inactive: "bg-white text-green-600 border-green-300 hover:border-green-500" },
  }

  const priorityStyles: Record<string, { active: string; inactive: string }> = {
    LOW: { active: "bg-gray-700 text-white border-gray-700", inactive: "bg-white text-gray-600 border-gray-300 hover:border-gray-500" },
    MEDIUM: { active: "bg-amber-600 text-white border-amber-600", inactive: "bg-white text-amber-600 border-amber-300 hover:border-amber-500" },
    HIGH: { active: "bg-red-600 text-white border-red-600", inactive: "bg-white text-red-600 border-red-300 hover:border-red-500" },
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50/80 rounded-xl border border-gray-200">
      {/* Row 1: search + my-tasks toggle + clear */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 h-9 bg-white border-gray-200 text-sm"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {showMyTasks && (
          <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            <button
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                !filters.myTasks
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setFilters({ myTasks: false })}
            >
              All Tasks
            </button>
            <button
              className={`px-4 py-2 text-xs font-semibold transition-colors ${
                filters.myTasks
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setFilters({ myTasks: true })}
            >
              My Tasks
            </button>
          </div>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-500 hover:text-gray-900 h-9">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Row 2: filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Status</span>
        {STATUS_OPTIONS.map((opt) => {
          const active = filters.status?.includes(opt.value)
          const s = statusStyles[opt.value]
          return (
            <button
              key={opt.value}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${active ? s.active : s.inactive}`}
              onClick={() => toggleStatus(opt.value)}
            >
              {opt.label}
            </button>
          )
        })}

        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-2 mr-1">Priority</span>
        {PRIORITY_OPTIONS.map((opt) => {
          const active = filters.priority?.includes(opt.value)
          const s = priorityStyles[opt.value]
          return (
            <button
              key={opt.value}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${active ? s.active : s.inactive}`}
              onClick={() => togglePriority(opt.value)}
            >
              {opt.label}
            </button>
          )
        })}

        {currentUserRole === "ADMIN" && users.length > 0 && (
          <Select
            value={filters.assignedToId ?? "all"}
            onValueChange={(v) =>
              setFilters({ assignedToId: !v || v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-40 h-7 text-xs bg-white border-gray-200">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex gap-2 ml-auto">
          <Input
            type="date"
            className="h-7 text-xs w-36 bg-white border-gray-200"
            value={filters.dueAfter ?? ""}
            onChange={(e) => setFilters({ dueAfter: e.target.value || undefined })}
          />
          <Input
            type="date"
            className="h-7 text-xs w-36 bg-white border-gray-200"
            value={filters.dueBefore ?? ""}
            onChange={(e) => setFilters({ dueBefore: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  )
}
