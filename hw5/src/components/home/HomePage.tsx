"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import PostCard from "@/components/post/PostCard"
import InlinePostComposer from "@/components/post/InlinePostComposer"
import { usePostUpdates } from "@/hooks/usePusher"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"all" | "following">("all")
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newPostsCount, setNewPostsCount] = useState(0)
  const { subscribe } = usePostUpdates()

  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  // Pusher: 監聽新貼文
  useEffect(() => {
    const unsubscribe = subscribe("new-post", (data: any) => {
      // 不自動添加到列表，而是顯示通知
      setNewPostsCount((prev) => prev + 1)
    })

    return unsubscribe
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/posts?type=${activeTab}`)
      const data = await res.json()
      if (res.ok) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("獲取貼文錯誤:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = () => {
    fetchPosts()
    setNewPostsCount(0)
  }

  const loadNewPosts = () => {
    fetchPosts()
    setNewPostsCount(0)
  }

  return (
    <div className="min-h-screen">
      {/* 新貼文通知 */}
      {newPostsCount > 0 && (
        <button
          onClick={loadNewPosts}
          className="sticky top-0 w-full bg-blue-600 text-white py-3 hover:bg-blue-700 transition-colors z-20 font-medium"
        >
          顯示 {newPostsCount} 則新貼文
        </button>
      )}

      {/* 標籤切換 */}
      <div className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-4 font-semibold transition-colors relative ${
              activeTab === "all"
                ? "text-gray-900"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            全部
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-4 font-semibold transition-colors relative ${
              activeTab === "following"
                ? "text-gray-900"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            關注中
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Inline 發文區 */}
      <InlinePostComposer onPostCreated={handlePostCreated} />

      {/* 貼文列表 */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">
          <p>載入中...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {activeTab === "following" ? (
            <>
              <p className="text-lg">還沒有關注任何人</p>
              <p className="text-sm mt-2">關注其他使用者來查看他們的貼文</p>
            </>
          ) : (
            <>
              <p className="text-lg">還沒有任何貼文</p>
              <p className="text-sm mt-2">成為第一個發文的人！</p>
            </>
          )}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={() => fetchPosts()}
            showCommentPreview={false}
          />
        ))
      )}
    </div>
  )
}

