import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    // 不能關注自己
    if (session.user.userId === params.userId) {
      return NextResponse.json({ error: "無法關注自己" }, { status: 400 })
    }

    // 查找要關注的使用者
    const targetUser = await prisma.user.findUnique({
      where: { userId: params.userId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 })
    }

    // 檢查是否已經關注
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      },
    })

    if (existingFollow) {
      // 取消關注
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      })

      // 更新統計
      await prisma.user.update({
        where: { id: session.user.id },
        data: { followingCount: { decrement: 1 } },
      })

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { followersCount: { decrement: 1 } },
      })

      return NextResponse.json({ following: false })
    } else {
      // 新增關注
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: targetUser.id,
        },
      })

      // 更新統計
      await prisma.user.update({
        where: { id: session.user.id },
        data: { followingCount: { increment: 1 } },
      })

      await prisma.user.update({
        where: { id: targetUser.id },
        data: { followersCount: { increment: 1 } },
      })

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error("關注錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

