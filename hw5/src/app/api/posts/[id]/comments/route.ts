import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parsePostContent } from "@/lib/validations/post"
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

    const { content, parentId } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "內容不能為空" },
        { status: 400 }
      )
    }

    const { hashtags, mentions, links } = parsePostContent(content)

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId: params.id,
        parentId: parentId || null,
        hashtags,
        mentions,
        links,
      },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // 更新貼文的評論數
    const post = await prisma.post.update({
      where: { id: params.id },
      data: { commentsCount: { increment: 1 } },
      select: { commentsCount: true },
    })

    // 如果是回覆某個評論，更新父評論的回覆數
    if (parentId) {
      await prisma.comment.update({
        where: { id: parentId },
        data: { commentsCount: { increment: 1 } },
      })
    }

    // Pusher: 觸發新評論事件
    if (isPusherConfigured()) {
      try {
        await pusher.trigger(`post-${params.id}`, "new-comment", {
          comment,
          commentsCount: post.commentsCount,
        })
      } catch (error) {
        console.error("Pusher 觸發錯誤:", error)
      }
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("建立評論錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const comments = await prisma.comment.findMany({
      where: {
        postId: params.id,
        parentId: null, // 只獲取頂層評論
      },
      include: {
        author: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                userId: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // 檢查當前使用者對評論的按讚狀態
    if (session?.user?.id) {
      const commentIds = comments.flatMap(c => [c.id, ...c.replies.map(r => r.id)])
      const userLikes = await prisma.like.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: commentIds },
        },
        select: { commentId: true },
      })
      
      const likedCommentIds = new Set(userLikes.map(l => l.commentId))
      
      const commentsWithLikeStatus = comments.map(comment => ({
        ...comment,
        isLiked: likedCommentIds.has(comment.id),
        replies: comment.replies.map(reply => ({
          ...reply,
          isLiked: likedCommentIds.has(reply.id),
        })),
      }))

      return NextResponse.json({ comments: commentsWithLikeStatus })
    }

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("獲取評論錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

