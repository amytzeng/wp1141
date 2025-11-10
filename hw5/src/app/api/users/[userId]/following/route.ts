import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // 取得該使用者關注的人
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
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
    const followingUsers = following.map(f => f.following)
    const followingIds = followingUsers.map(u => u.id)

    let usersWithFollowStatus = followingUsers
    if (session.user.id) {
      const currentUserFollowing = await prisma.follow.findMany({
        where: {
          followerId: session.user.id,
          followingId: { in: followingIds },
        },
        select: { followingId: true },
      })

      const followingSet = new Set(currentUserFollowing.map(f => f.followingId))

      usersWithFollowStatus = followingUsers.map(user => ({
        ...user,
        isFollowing: followingSet.has(user.id),
        isCurrentUser: user.id === session.user.id,
      }))
    }

    return NextResponse.json({ users: usersWithFollowStatus })
  } catch (error) {
    console.error("獲取關注列表錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

