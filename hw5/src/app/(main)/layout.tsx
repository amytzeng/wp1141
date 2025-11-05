import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Sidebar from "@/components/layout/Sidebar"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // 如果使用者還沒有設置 userId，重定向到註冊頁面
  if (!session.user.userId) {
    redirect("/register")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 max-w-2xl border-r border-gray-200 bg-white">
        {children}
      </main>
      <aside className="w-80 p-4 hidden lg:block">
        {/* 右邊欄可以之後添加趨勢、推薦使用者等 */}
      </aside>
    </div>
  )
}

