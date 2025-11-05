import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: params.userId },
      select: {
        id: true,
        userId: true,
        name: true,
        image: true,
        bio: true,
        coverImage: true,
        postsCount: true,
        followersCount: true,
        followingCount: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "找不到使用者" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("獲取使用者錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    // 檢查是否為本人
    if (session.user.userId !== params.userId) {
      return NextResponse.json({ error: "無權編輯此個人資料" }, { status: 403 })
    }

    const { name, bio, image, coverImage } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio,
        image,
        coverImage,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("更新使用者錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

