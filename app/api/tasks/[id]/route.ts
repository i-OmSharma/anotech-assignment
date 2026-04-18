import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateTaskSchema } from "@/lib/validations"
import { ApiResponse, TaskWithUsers } from "@/types"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    if (!task) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Task not found" },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse<TaskWithUsers>>({
      data: task as unknown as TaskWithUsers,
      error: null,
    })
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const task = await prisma.task.findUnique({ where: { id } })

    if (!task) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Task not found" },
        { status: 404 }
      )
    }

    const body = await req.json()
    const parsed = UpdateTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, status, priority, dueDate, assignedToId } =
      parsed.data

    // Only ADMIN can change assignedToId
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (assignedToId !== undefined && session.user.role === "ADMIN") {
      updateData.assignedToId = assignedToId ?? null
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return NextResponse.json<ApiResponse<TaskWithUsers>>({
      data: updated as unknown as TaskWithUsers,
      error: null,
    })
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const task = await prisma.task.findUnique({ where: { id } })

    if (!task) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Task not found" },
        { status: 404 }
      )
    }

    if (task.createdById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Forbidden" },
        { status: 403 }
      )
    }

    await prisma.task.delete({ where: { id } })

    return NextResponse.json<ApiResponse<{ id: string }>>({
      data: { id },
      error: null,
    })
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
