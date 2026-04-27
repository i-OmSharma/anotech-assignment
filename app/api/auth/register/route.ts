import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { RegisterSchema } from "@/lib/validations"
import { ApiResponse } from "@/types"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Email already registered" },
        { status: 409 }
      )
    }

    const hashed = await hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json<ApiResponse<typeof user>>(
      { data: user, error: null },
      { status: 201 }
    )
  } catch (error) {
    // Handle Prisma unique constraint violation (duplicate email)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Email already registered" },
        { status: 409 }
      )
    }
    console.error('Register error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    )
  }

}
