"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"
import { TaskFilters } from "@/types"

export function useTaskFilters(): [TaskFilters, (filters: Partial<TaskFilters>) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: TaskFilters = useMemo(() => ({
    status: searchParams.getAll("status"),
    priority: searchParams.getAll("priority"),
    assignedToId: searchParams.get("assignedToId") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    myTasks: searchParams.get("myTasks") === "true",
    dueBefore: searchParams.get("dueBefore") ?? undefined,
    dueAfter: searchParams.get("dueAfter") ?? undefined,
  }), [searchParams])

  const setFilters = useCallback(
    (newFilters: Partial<TaskFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      if (newFilters.status !== undefined) {
        params.delete("status")
        newFilters.status.forEach((s) => params.append("status", s))
      }
      if (newFilters.priority !== undefined) {
        params.delete("priority")
        newFilters.priority.forEach((p) => params.append("priority", p))
      }
      if (newFilters.assignedToId !== undefined) {
        if (newFilters.assignedToId) params.set("assignedToId", newFilters.assignedToId)
        else params.delete("assignedToId")
      }
      if (newFilters.search !== undefined) {
        if (newFilters.search) params.set("search", newFilters.search)
        else params.delete("search")
      }
      if (newFilters.myTasks !== undefined) {
        if (newFilters.myTasks) params.set("myTasks", "true")
        else params.delete("myTasks")
      }
      if (newFilters.dueBefore !== undefined) {
        if (newFilters.dueBefore) params.set("dueBefore", newFilters.dueBefore)
        else params.delete("dueBefore")
      }
      if (newFilters.dueAfter !== undefined) {
        if (newFilters.dueAfter) params.set("dueAfter", newFilters.dueAfter)
        else params.delete("dueAfter")
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return [filters, setFilters]
}
