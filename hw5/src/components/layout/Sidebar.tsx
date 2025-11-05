"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-3 hover:bg-gray-100">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {session?.user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-semibold text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  @{session?.user?.userId}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      {/* Post Modal */}
      {showPostModal && (
        <PostModal onClose={() => setShowPostModal(false)} />
      )}
    </>
  )
}

