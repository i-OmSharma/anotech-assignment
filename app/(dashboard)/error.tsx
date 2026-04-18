"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
      <p className="text-muted-foreground text-sm mb-6">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}
