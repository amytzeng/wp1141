import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parsePostContent, postSchema } from "@/lib/validations/post"
import { pusher, isPusherConfigured } from "@/lib/pusher"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    const body = await req.json()
    const validation = postSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content } = validation.data
    const { hashtags, mentions, links } = parsePostContent(content)

    const post = await prisma.post.create({
      data: {
        content,
        authorId: session.user.id,
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
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
    })

    // 更新使用者的 postsCount
    await prisma.user.update({
      where: { id: session.user.id },
      data: { postsCount: { increment: 1 } },
    })

    // Pusher: 觸發新貼文事件
    if (isPusherConfigured()) {
      try {
        await pusher.trigger("posts", "new-post", {
          post,
        })
      } catch (error) {
        console.error("Pusher 觸發錯誤:", error)
      }
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("建立貼文錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "all"
    const cursor = searchParams.get("cursor")
    const limit = 20

    let posts

    if (type === "following" && session?.user?.id) {
      // 獲取 following 的使用者 IDs
      const following = await prisma.follow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true },
      })

      const followingIds = following.map((f) => f.followingId)

      posts = await prisma.post.findMany({
        where: {
          authorId: { in: followingIds },
        },
        take: limit,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor },
        }),
        orderBy: { createdAt: "desc" },
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
    } else {
      posts = await prisma.post.findMany({
        take: limit,
        ...(cursor && {
          skip: 1,
          cursor: { id: cursor },
        }),
        orderBy: { createdAt: "desc" },
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
    }

    // 檢查當前使用者是否已按讚和轉發
    if (session?.user?.id) {
      const postIds = posts.map(p => p.id)
      
      // 檢查按讚
      const userLikes = await prisma.like.findMany({
        where: {
          userId: session.user.id,
          postId: { in: postIds },
        },
        select: { postId: true },
      })
      
      // 檢查轉發
      const userReposts = await prisma.repost.findMany({
        where: {
          userId: session.user.id,
          postId: { in: postIds },
        },
        select: { postId: true },
      })
      
      const likedPostIds = new Set(userLikes.map(l => l.postId))
      const repostedPostIds = new Set(userReposts.map(r => r.postId))
      
      const postsWithStatus = posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        isReposted: repostedPostIds.has(post.id),
      }))

      return NextResponse.json({
        posts: postsWithStatus,
        nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
      })
    }

    return NextResponse.json({
      posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
    })
  } catch (error) {
    console.error("獲取貼文錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

