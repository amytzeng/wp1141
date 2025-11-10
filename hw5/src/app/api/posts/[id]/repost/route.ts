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

    const postId = params.id

    // 檢查貼文是否存在以及是否為自己的貼文
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!post) {
      return NextResponse.json({ error: "找不到貼文" }, { status: 404 })
    }

    // 不能轉發自己的貼文
    if (post.authorId === session.user.id) {
      return NextResponse.json({ error: "不能轉發自己的貼文" }, { status: 400 })
    }

    // 檢查是否已經轉發
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    let repostsCount
    let reposted

    if (existingRepost) {
      // 取消轉發
      await prisma.repost.delete({
        where: { id: existingRepost.id },
      })

      const post = await prisma.post.update({
        where: { id: postId },
        data: { repostsCount: { decrement: 1 } },
        select: { repostsCount: true },
      })

      repostsCount = post.repostsCount
      reposted = false
    } else {
      // 新增轉發
      await prisma.repost.create({
        data: {
          userId: session.user.id,
          postId,
        },
      })

      const post = await prisma.post.update({
        where: { id: postId },
        data: { repostsCount: { increment: 1 } },
        select: { repostsCount: true },
      })

      repostsCount = post.repostsCount
      reposted = true
    }

    return NextResponse.json({
      reposted,
      repostsCount,
    })
  } catch (error) {
    console.error("轉發錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

