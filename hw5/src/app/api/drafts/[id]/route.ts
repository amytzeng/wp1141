import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    // 檢查草稿是否屬於當前使用者
    const draft = await prisma.draft.findUnique({
      where: { id: params.id },
    })

    if (!draft) {
      return NextResponse.json({ error: "找不到草稿" }, { status: 404 })
    }

    if (draft.userId !== session.user.id) {
      return NextResponse.json({ error: "無權刪除此草稿" }, { status: 403 })
    }

    await prisma.draft.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("刪除草稿錯誤:", error)
    return NextResponse.json(
      { error: "內部伺服器錯誤" },
      { status: 500 }
    )
  }
}

