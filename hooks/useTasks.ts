import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { TaskWithUsers, ApiResponse, TaskFilters } from "@/types"
import { TaskInput, UpdateTaskInput } from "@/lib/validations"

function buildTaskQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams()
  if (filters.status?.length) filters.status.forEach((s) => params.append("status", s))
  if (filters.priority?.length) filters.priority.forEach((p) => params.append("priority", p))
  if (filters.assignedToId) params.set("assignedToId", filters.assignedToId)
  if (filters.search) params.set("search", filters.search)
  if (filters.myTasks) params.set("myTasks", "true")
  if (filters.dueBefore) params.set("dueBefore", filters.dueBefore)
  if (filters.dueAfter) params.set("dueAfter", filters.dueAfter)
  return params.toString()
}

async function fetchTasks(filters: TaskFilters): Promise<TaskWithUsers[]> {
  const qs = buildTaskQueryString(filters)
  const res = await fetch(`/api/tasks?${qs}`)
  const json: ApiResponse<TaskWithUsers[]> = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data ?? []
}

async function fetchTask(id: string): Promise<TaskWithUsers> {
  const res = await fetch(`/api/tasks/${id}`)
  const json: ApiResponse<TaskWithUsers> = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data!
}

async function createTask(data: TaskInput): Promise<TaskWithUsers> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json: ApiResponse<TaskWithUsers> = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data!
}

async function updateTask({
  id,
  data,
}: {
  id: string
  data: UpdateTaskInput
}): Promise<TaskWithUsers> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json: ApiResponse<TaskWithUsers> = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data!
}

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
  const json: ApiResponse<unknown> = await res.json()
  if (json.error) throw new Error(json.error)
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchTasks(filters),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
      toast.success("Task created")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueriesData<TaskWithUsers[]>({ queryKey: ["tasks"] })
      qc.setQueriesData<TaskWithUsers[]>({ queryKey: ["tasks"] }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, ...data } : t))
      )
      return { prev }
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val))
      }
      toast.error(err.message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
    },
    onSuccess: () => {
      toast.success("Task updated")
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] })
      const prev = qc.getQueriesData<TaskWithUsers[]>({ queryKey: ["tasks"] })
      qc.setQueriesData<TaskWithUsers[]>({ queryKey: ["tasks"] }, (old) =>
        old?.filter((t) => t.id !== id)
      )
      return { prev }
    },
    onError: (err: Error, _id, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val))
      }
      toast.error(err.message)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
    },
    onSuccess: () => {
      toast.success("Task deleted")
    },
  })
}
