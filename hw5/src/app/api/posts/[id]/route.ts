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
    const post = await prisma.post.findUnique({
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
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "找不到貼文" }, { status: 404 })
    }

    // 檢查當前使用者是否已按讚
    let isLiked = false
    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: params.id,
          },
        },
      })
      isLiked = !!like
    }

    return NextResponse.json({ post: { ...post, isLiked } })
  } catch (error) {
    console.error("獲取貼文錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json({ error: "找不到貼文" }, { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "無權刪除此貼文" }, { status: 403 })
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    // 更新使用者的 postsCount
    await prisma.user.update({
      where: { id: session.user.id },
      data: { postsCount: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("刪除貼文錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

