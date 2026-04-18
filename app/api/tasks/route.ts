import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TaskSchema } from "@/lib/validations"
import { ApiResponse, TaskWithUsers } from "@/types"
import { Prisma, Status, Priority } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.getAll("status") as Status[]
    const priority = searchParams.getAll("priority") as Priority[]
    const assignedToId = searchParams.get("assignedToId")
    const search = searchParams.get("search")
    const myTasks = searchParams.get("myTasks") === "true"
    const dueBefore = searchParams.get("dueBefore")
    const dueAfter = searchParams.get("dueAfter")

    const where: Prisma.TaskWhereInput = {}

    // MEMBER sees only tasks they created or are assigned to, unless viewing all
    if (session.user.role !== "ADMIN" || myTasks) {
      where.OR = [
        { createdById: session.user.id },
        { assignedToId: session.user.id },
      ]
    } else if (myTasks) {
      where.OR = [
        { createdById: session.user.id },
        { assignedToId: session.user.id },
      ]
    }

    if (status.length > 0) where.status = { in: status }
    if (priority.length > 0) where.priority = { in: priority }
    if (assignedToId) where.assignedToId = assignedToId
    if (search) {
      const searchCondition: Prisma.TaskWhereInput = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
      where.AND = where.AND
        ? [
            ...(Array.isArray(where.AND) ? where.AND : [where.AND]),
            searchCondition,
          ]
        : searchCondition
    }
    if (dueBefore) where.dueDate = { ...((where.dueDate as object) ?? {}), lte: new Date(dueBefore) }
    if (dueAfter) where.dueDate = { ...((where.dueDate as object) ?? {}), gte: new Date(dueAfter) }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json<ApiResponse<TaskWithUsers[]>>({
      data: tasks as unknown as TaskWithUsers[],
      error: null,
    })
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = TaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, status, priority, dueDate, assignedToId } =
      parsed.data

    // Only ADMIN can assign tasks to others
    const actualAssignedToId =
      session.user.role === "ADMIN" ? assignedToId : undefined

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: session.user.id,
        assignedToId: actualAssignedToId ?? null,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return NextResponse.json<ApiResponse<TaskWithUsers>>(
      { data: task as unknown as TaskWithUsers, error: null },
      { status: 201 }
    )
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
