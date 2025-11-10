"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck } from "lucide-react"
import Link from "next/link"

interface FollowListModalProps {
  userId: string
  type: "following" | "followers"
  onClose: () => void
  onFollowChange?: () => void
}

interface User {
  id: string
  userId: string
  name: string
  image: string
  bio: string
  followersCount: number
  isFollowing: boolean
  isCurrentUser: boolean
}

export default function FollowListModal({ userId, type, onClose, onFollowChange }: FollowListModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [userId, type])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const endpoint = type === "following" 
        ? `/api/users/${userId}/following`
        : `/api/users/${userId}/followers`
      
      const res = await fetch(endpoint)
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("獲取列表錯誤:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetUserId: string) => {
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      })

      if (res.ok) {
        // 更新本地狀態
        setUsers(prev =>
          prev.map(user =>
            user.userId === targetUserId
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
        
        // 通知父組件更新數字
        if (onFollowChange) {
          onFollowChange()
        }
      }
    } catch (error) {
      console.error("關注操作失敗:", error)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold">
            {type === "following" ? "關注中" : "關注者"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">載入中...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {type === "following" ? "還沒有關注任何人" : "還沒有關注者"}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* 左側：使用者資訊 */}
                    <Link
                      href={`/profile/${user.userId}`}
                      onClick={onClose}
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
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-semibold text-gray-900">
                            {user.followersCount}
                          </span>{" "}
                          關注者
                        </p>
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
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

