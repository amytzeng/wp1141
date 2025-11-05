import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusher, isPusherConfigured } from "@/lib/pusher"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    const postId = params.id

    // 檢查是否已經按讚
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
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

      const post = await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      })

      likesCount = post.likesCount
      liked = false
    } else {
      // 新增按讚
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      })

      const post = await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true },
      })

      likesCount = post.likesCount
      liked = true
    }

    // Pusher: 觸發即時更新事件
    if (isPusherConfigured()) {
      try {
        await pusher.trigger(`post-${postId}`, "like-update", {
          postId,
          likesCount,
          userId: session.user.id,
          action: liked ? "like" : "unlike",
        })
      } catch (error) {
        console.error("Pusher 觸發錯誤:", error)
      }
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

