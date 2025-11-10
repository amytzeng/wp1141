import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                userId: true,
                name: true,
                image: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                userId: true,
                name: true,
              },
            },
          },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                userId: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "找不到留言" }, { status: 404 })
    }

    // 檢查當前使用者是否已按讚
    let isLiked = false
    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId: params.id,
          },
        },
      })
      isLiked = !!like

      // 檢查回覆的按讚狀態
      const replyIds = comment.replies.map(r => r.id)
      if (replyIds.length > 0) {
        const replyLikes = await prisma.like.findMany({
          where: {
            userId: session.user.id,
            commentId: { in: replyIds },
          },
          select: { commentId: true },
        })
        const likedReplyIds = new Set(replyLikes.map(l => l.commentId))
        
        comment.replies = comment.replies.map(reply => ({
          ...reply,
          isLiked: likedReplyIds.has(reply.id),
        })) as any
      }
    }

    return NextResponse.json({
      comment: {
        ...comment,
        isLiked,
      },
    })
  } catch (error) {
    console.error("獲取留言錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

