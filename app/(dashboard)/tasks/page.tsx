import { auth } from "@/lib/auth"
import { Suspense } from "react"
import { TasksPageClient } from "./TasksPageClient"

export default async function TasksPage() {
  const session = await auth()

  return (
    <Suspense fallback={<div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />}>
      <TasksPageClient
        currentUserId={session!.user.id}
        currentUserRole={session!.user.role}
      />
    </Suspense>
  )
}
