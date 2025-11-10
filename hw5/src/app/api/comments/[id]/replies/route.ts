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

    const body = await req.json()
    const { content } = body

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "內容不能為空" }, { status: 400 })
    }

    // 檢查父留言是否存在
    const parentComment = await prisma.comment.findUnique({
      where: { id: params.id },
      select: { id: true, postId: true },
    })

    if (!parentComment) {
      return NextResponse.json({ error: "找不到留言" }, { status: 404 })
    }

    // 創建回覆
    const reply = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId: parentComment.postId,
        parentId: params.id,
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
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    })

    // 更新貼文的留言總數
    await prisma.post.update({
      where: { id: parentComment.postId },
      data: { commentsCount: { increment: 1 } },
    })

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("建立回覆錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

