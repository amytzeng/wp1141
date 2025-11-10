import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登入" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.trim() === "") {
      return NextResponse.json({ users: [] })
    }

    // 搜尋用戶名稱或 userId
    // SQLite 不支援 mode: "insensitive"，改用 contains（預設大小寫敏感）
    // 我們先取得所有用戶，然後在應用層進行大小寫不敏感的過濾
    const allUsers = await prisma.user.findMany({
      where: {
        userId: {
          not: null, // 只搜尋已設定 userId 的用戶
        },
      },
      select: {
        id: true,
        userId: true,
        name: true,
        image: true,
        bio: true,
        postsCount: true,
        followersCount: true,
        followingCount: true,
      },
    })

    // 在應用層進行大小寫不敏感的搜尋
    const searchLower = query.toLowerCase()
    const users = allUsers
      .filter((user) => {
        const nameLower = (user.name || "").toLowerCase()
        const userIdLower = (user.userId || "").toLowerCase()
        return nameLower.includes(searchLower) || userIdLower.includes(searchLower)
      })
      .sort((a, b) => b.followersCount - a.followersCount) // 按關注者數量排序
      .slice(0, 20) // 限制結果數量

    // 檢查當前使用者是否已關注這些用戶
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const isFollowing = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
        })

        return {
          ...user,
          isFollowing: !!isFollowing,
          isCurrentUser: user.id === session.user.id,
        }
      })
    )

    return NextResponse.json({ users: usersWithFollowStatus })
  } catch (error) {
    console.error("搜尋錯誤:", error)
    return NextResponse.json({ error: "搜尋失敗" }, { status: 500 })
  }
}

