"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, User, PenSquare, LogOut } from "lucide-react"
import { useState } from "react"
import PostModal from "../post/PostModal"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [showPostModal, setShowPostModal] = useState(false)

  const navItems = [
    { href: "/home", label: "首頁", icon: Home },
    { href: `/profile/${session?.user?.userId}`, label: "個人檔案", icon: User },
  ]

  return (
    <>
      <aside className="w-64 h-screen sticky top-0 border-r border-gray-200 flex flex-col p-4 bg-white">
        {/* Logo */}
        <div className="mb-8 px-3">
          <h1 className="text-3xl font-bold text-blue-600">Echo</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start text-lg font-medium"
                >
                  <Icon className="mr-4 h-6 w-6" />
                  {item.label}
                </Button>
              </Link>
            )
          })}

          {/* Post Button */}
          <Button
            onClick={() => setShowPostModal(true)}
            className="w-full text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <PenSquare className="mr-4 h-6 w-6" />
            發文
          </Button>
        </nav>

        {/* ==================== 左下角帳號區域 ==================== */}
        {/* 點擊後會顯示下拉選單，包含「個人檔案」和「登出」選項 */}
        <DropdownMenu>
          {/* 觸發按鈕：顯示使用者頭像、姓名和 userID */}
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-3 hover:bg-gray-100">
              {/* 使用者頭像 */}
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {/* 使用者資訊：姓名和 userID */}
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-semibold text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  @{session?.user?.userId}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          
          {/* 下拉選單內容 */}
          <DropdownMenuContent align="end" className="w-48">
            {/* 選項 1：個人檔案 - 跳轉到使用者的個人頁面 */}
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push(`/profile/${session?.user?.userId}`)}
            >
              <User className="mr-2 h-4 w-4" />
              個人檔案
            </DropdownMenuItem>
            
            {/* 選項 2：登出 - 登出並返回登入頁面 */}
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* ==================== 左下角帳號區域結束 ==================== */}
      </aside>

      {/* Post Modal */}
      {showPostModal && (
        <PostModal onClose={() => setShowPostModal(false)} />
      )}
    </>
  )
}

