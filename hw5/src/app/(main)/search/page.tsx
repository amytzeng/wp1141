"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, UserCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface User {
  id: string
  userId: string
  name: string
  image: string
  bio: string
  postsCount: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isCurrentUser: boolean
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [query, setQuery] = useState(initialQuery)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([])
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("搜尋錯誤:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query)
      // 更新 URL
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleFollow = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      })

      if (res.ok) {
        // 更新本地狀態
        setUsers((prev) =>
          prev.map((user) =>
            user.userId === userId
              ? {
                  ...user,
                  isFollowing: !user.isFollowing,
                  followersCount: user.isFollowing
                    ? user.followersCount - 1
                    : user.followersCount + 1,
                }
              : user
          )
        )
      }
    } catch (error) {
      console.error("關注操作失敗:", error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* 標題 */}
      <div className="border-b border-gray-200 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <h2 className="text-xl font-bold">搜尋使用者</h2>
      </div>

      {/* 搜尋框 */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-[73px] z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋姓名或使用者代碼..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4 py-3 text-base"
            autoFocus
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          按 Enter 搜尋，或點擊下方結果
        </p>
      </div>

      {/* 搜尋結果 */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">搜尋中...</div>
        ) : !searched ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>輸入姓名或使用者代碼開始搜尋</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>找不到符合「{query}」的使用者</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* 左側：頭像和資訊 */}
                <Link
                  href={`/profile/${user.userId}`}
                  className="flex items-start gap-3 flex-1 min-w-0"
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold hover:underline truncate">
                        {user.name}
                      </p>
                      {user.isCurrentUser && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                          你
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      @{user.userId}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>
                        <span className="font-semibold text-gray-900">
                          {user.postsCount}
                        </span>{" "}
                        貼文
                      </span>
                      <span>
                        <span className="font-semibold text-gray-900">
                          {user.followersCount}
                        </span>{" "}
                        關注者
                      </span>
                      <span>
                        <span className="font-semibold text-gray-900">
                          {user.followingCount}
                        </span>{" "}
                        關注中
                      </span>
                    </div>
                  </div>
                </Link>

                {/* 右側：關注按鈕 */}
                {!user.isCurrentUser && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      handleFollow(user.userId)
                    }}
                    variant={user.isFollowing ? "outline" : "default"}
                    size="sm"
                    className={
                      user.isFollowing
                        ? "flex-shrink-0"
                        : "flex-shrink-0 bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    {user.isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        正在關注
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        關注
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

