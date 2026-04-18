"use client"

import { useCallback, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {showMyTasks && (
          <div className="flex rounded-lg border overflow-hidden">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                !filters.myTasks
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-muted-foreground hover:bg-gray-50"
              }`}
              onClick={() => setFilters({ myTasks: false })}
            >
              All Tasks
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filters.myTasks
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-muted-foreground hover:bg-gray-50"
              }`}
              onClick={() => setFilters({ myTasks: true })}
            >
              My Tasks
            </button>
          </div>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1">
          {STATUS_OPTIONS.map((opt) => {
            const active = filters.status?.includes(opt.value)
            return (
              <Badge
                key={opt.value}
                variant={active ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => toggleStatus(opt.value)}
              >
                {opt.label}
              </Badge>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-1">
          {PRIORITY_OPTIONS.map((opt) => {
            const active = filters.priority?.includes(opt.value)
            return (
              <Badge
                key={opt.value}
                variant={active ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => togglePriority(opt.value)}
              >
                {opt.label}
              </Badge>
            )
          })}
        </div>

        {currentUserRole === "ADMIN" && users.length > 0 && (
          <Select
            value={filters.assignedToId ?? "all"}
            onValueChange={(v) =>
              setFilters({ assignedToId: !v || v === "all" ? undefined : v })
            }
          >
            <SelectTrigger className="w-44 h-6 text-xs">
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

        <div className="flex gap-2">
          <Input
            type="date"
            className="h-6 text-xs w-36"
            placeholder="Due after"
            value={filters.dueAfter ?? ""}
            onChange={(e) => setFilters({ dueAfter: e.target.value || undefined })}
          />
          <Input
            type="date"
            className="h-6 text-xs w-36"
            placeholder="Due before"
            value={filters.dueBefore ?? ""}
            onChange={(e) => setFilters({ dueBefore: e.target.value || undefined })}
          />
        </div>
      </div>
    </div>
  )
}
