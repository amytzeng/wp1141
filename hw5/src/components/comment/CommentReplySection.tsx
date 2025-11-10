"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import CommentCard from "../post/CommentCard"
import { useRouter } from "next/navigation"

interface CommentReplySectionProps {
  commentId: string
}

export default function CommentReplySection({ commentId }: CommentReplySectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [fetchingReplies, setFetchingReplies] = useState(true)

  useEffect(() => {
    fetchReplies()
  }, [commentId])

  const fetchReplies = async () => {
    try {
      const res = await fetch(`/api/comments/${commentId}`)
      const data = await res.json()
      
      if (res.ok && data.comment.replies) {
        setReplies(data.comment.replies)
      }
    } catch (error) {
      console.error("獲取回覆錯誤:", error)
    } finally {
      setFetchingReplies(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setLoading(true)

    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        setContent("")
        fetchReplies()
        router.refresh()
      }
    } catch (error) {
      console.error("回覆失敗:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* 回覆輸入框 */}
      <div className="border-b border-gray-200 p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-blue-500 text-white">
                {session?.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="發布你的回覆"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] resize-none border-0 focus-visible:ring-0 text-lg"
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  disabled={!content.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "回覆中..." : "回覆"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* 回覆列表 */}
      <div>
        {fetchingReplies ? (
          <div className="p-8 text-center text-gray-500">載入回覆中...</div>
        ) : replies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            還沒有人回覆此留言
          </div>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              onClick={() => router.push(`/comment/${reply.id}`)}
              className="cursor-pointer"
            >
              <CommentCard comment={reply} postId={commentId} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

