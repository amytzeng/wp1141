import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "未登入" }, { status: 401 })
    }

    // 找到該使用者
    const user = await prisma.user.findUnique({
      where: { userId: params.userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "使用者不存在" }, { status: 404 })
    }

    // 取得該使用者的關注者
    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: {
            id: true,
            userId: true,
            name: true,
            image: true,
            bio: true,
            followersCount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // 檢查當前使用者是否關注這些人
    const followerUsers = followers.map(f => f.follower)
    const followerIds = followerUsers.map(u => u.id)

    let usersWithFollowStatus = followerUsers
    if (session.user.id) {
      const currentUserFollowing = await prisma.follow.findMany({
        where: {
          followerId: session.user.id,
          followingId: { in: followerIds },
        },
        select: { followingId: true },
      })

      const followingSet = new Set(currentUserFollowing.map(f => f.followingId))

      usersWithFollowStatus = followerUsers.map(user => ({
        ...user,
        isFollowing: followingSet.has(user.id),
        isCurrentUser: user.id === session.user.id,
      }))
    }

    return NextResponse.json({ users: usersWithFollowStatus })
  } catch (error) {
    console.error("獲取關注者列表錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

