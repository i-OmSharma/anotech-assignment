"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteTask } from "@/hooks/useTasks"

interface DeleteConfirmDialogProps {
  taskId: string
  taskTitle: string
}

export function DeleteConfirmDialog({ taskId, taskTitle }: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteMutation = useDeleteTask()

  async function handleDelete() {
    await deleteMutation.mutateAsync(taskId)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
        aria-label="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>
            This will permanently delete &ldquo;{taskTitle}&rdquo;. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
