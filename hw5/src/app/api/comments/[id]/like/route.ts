import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    const commentId = params.id

    // 檢查是否已經按讚
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    })

    let likesCount
    let liked

    if (existingLike) {
      // 取消按讚
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      })

      likesCount = comment.likesCount
      liked = false
    } else {
      // 新增按讚
      await prisma.like.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      })

      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true },
      })

      likesCount = comment.likesCount
      liked = true
    }

    return NextResponse.json({
      liked,
      likesCount,
    })
  } catch (error) {
    console.error("按讚錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

