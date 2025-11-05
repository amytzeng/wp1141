import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    const { userId } = await req.json()

    // 驗證 userId 格式
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(userId)) {
      return NextResponse.json(
        { error: "使用者 ID 格式不正確（需要 3-20 個字符，僅限字母、數字和底線）" },
        { status: 400 }
      )
    }

    // 檢查 userId 是否已被使用
    const existing = await prisma.user.findUnique({
      where: { userId },
    })

    if (existing) {
      return NextResponse.json(
        { error: "此使用者 ID 已被使用" },
        { status: 409 }
      )
    }

    // 更新使用者的 userId
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { userId },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("註冊錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")

    if (search) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { userId: { contains: search } },
            { name: { contains: search } },
          ],
        },
        select: {
          id: true,
          userId: true,
          name: true,
          image: true,
          bio: true,
        },
        take: 10,
      })
      return NextResponse.json({ users })
    }

    return NextResponse.json({ users: [] })
  } catch (error) {
    console.error("搜尋使用者錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

