"use client"

import { useState } from "react"
import PostCard from "@/components/post/PostCard"
import { useRouter } from "next/navigation"

interface ProfileTabsProps {
  posts: any[]
  likedPosts: any[]
  isOwnProfile: boolean
}

export default function ProfileTabs({ 
  posts, 
  likedPosts, 
  isOwnProfile 
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts")
  const router = useRouter()

  return (
    <div>
      {/* 標籤切換 */}
      <div className="border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-4 font-semibold transition-colors relative ${
            activeTab === "posts"
              ? "text-gray-900"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          貼文
          {activeTab === "posts" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
          )}
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-4 font-semibold transition-colors relative ${
              activeTab === "likes"
                ? "text-gray-900"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            喜歡的內容
            {activeTab === "likes" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* 標籤內容 */}
      <div>
        {activeTab === "posts" && (
          <div>
            {posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">還沒有發表任何貼文</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onDelete={() => router.refresh()}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "likes" && isOwnProfile && (
          <div>
            {likedPosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">還沒有按讚任何貼文</p>
              </div>
            ) : (
              likedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

