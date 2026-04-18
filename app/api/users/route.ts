import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApiResponse, UserSummary } from "@/types"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Forbidden" },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json<ApiResponse<UserSummary[]>>({
      data: users,
      error: null,
    })
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    )
  }
}
