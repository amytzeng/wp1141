"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import EditProfileModal from "./EditProfileModal"
import FollowListModal from "./FollowListModal"

interface ProfileHeaderProps {
  user: any
  isOwnProfile: boolean
  isFollowing: boolean
  postsCount: number
  followersCount: number
  followingCount: number
}

export default function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing: initialIsFollowing,
  postsCount,
  followersCount,
  followingCount,
}: ProfileHeaderProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFollowListModal, setShowFollowListModal] = useState<"following" | "followers" | null>(null)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followers, setFollowers] = useState(followersCount)
  const [following, setFollowing] = useState(followingCount)

  const handleFollow = async () => {
    const prevFollowing = isFollowing
    const prevFollowers = followers
    
    // 樂觀更新
    setIsFollowing(!isFollowing)
    setFollowers(isFollowing ? followers - 1 : followers + 1)

    try {
      const res = await fetch(`/api/users/${user.userId}/follow`, {
        method: "POST",
      })

      if (res.ok) {
        // 成功後刷新頁面，確保數字同步
        router.refresh()
      } else {
        // 回滾
        setIsFollowing(prevFollowing)
        setFollowers(prevFollowers)
      }
    } catch (error) {
      // 回滾
      setIsFollowing(prevFollowing)
      setFollowers(prevFollowers)
    }
  }

  return (
    <>
      <div className="border-b border-gray-200">
        {/* 頂部導航 */}
        <div className="flex items-center gap-4 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <Link href="/home">
            <button className="hover:bg-gray-100 rounded-full p-2 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-500">{postsCount} 則貼文</p>
          </div>
        </div>

        {/* 背景圖 */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500">
            {user.coverImage && (
              <img 
                src={user.coverImage} 
                alt="背景圖" 
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* 頭像 */}
          <div className="absolute -bottom-16 left-4">
            <Avatar className="h-32 w-32 border-4 border-white">
              <AvatarImage src={user.image || ""} />
              <AvatarFallback className="bg-blue-500 text-white text-3xl">
                {user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* 編輯或關注按鈕 */}
          <div className="absolute bottom-4 right-4">
            {isOwnProfile ? (
              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
                className="bg-white font-semibold"
              >
                編輯個人資料
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                className={
                  isFollowing
                    ? "bg-white text-gray-900 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-semibold"
                    : "bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                }
              >
                {isFollowing ? "正在關注" : "關注"}
              </Button>
            )}
          </div>
        </div>

        {/* 使用者資訊 */}
        <div className="px-4 mt-20 pb-4">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">@{user.userId}</p>
          
          {user.bio && (
            <p className="mt-3 text-gray-900">{user.bio}</p>
          )}

          {/* 統計數字 */}
          <div className="flex gap-6 mt-4">
            <button
              onClick={() => setShowFollowListModal("following")}
              className="hover:underline cursor-pointer transition-colors"
            >
              <span className="font-bold">{following}</span>
              <span className="text-gray-500 ml-1">關注中</span>
            </button>
            <button
              onClick={() => setShowFollowListModal("followers")}
              className="hover:underline cursor-pointer transition-colors"
            >
              <span className="font-bold">{followers}</span>
              <span className="text-gray-500 ml-1">關注者</span>
            </button>
          </div>
        </div>
      </div>

      {/* 編輯個人資料 Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => {
            setShowEditModal(false)
            router.refresh()
          }}
        />
      )}

      {/* 關注列表 Modal */}
      {showFollowListModal && (
        <FollowListModal
          userId={user.userId}
          type={showFollowListModal}
          onClose={() => setShowFollowListModal(null)}
          onFollowChange={() => router.refresh()}
        />
      )}
    </>
  )
}

