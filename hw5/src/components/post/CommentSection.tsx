"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import CommentCard from "./CommentCard"
import { useRouter } from "next/navigation"

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<any[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`)
      const data = await res.json()
      if (res.ok) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error("獲取評論錯誤:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          parentId: replyTo,
        }),
      })

      if (res.ok) {
        setContent("")
        setReplyTo(null)
        await fetchComments()
        router.refresh()
      }
    } catch (error) {
      console.error("發表評論錯誤:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = (commentId: string) => {
    setReplyTo(commentId)
    // 可以在這裡添加更多 UI 邏輯，如滾動到輸入框
  }

  return (
    <div>
      {/* 評論輸入框 */}
      <div className="border-b border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-blue-500 text-white">
              {session?.user?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {replyTo && (
              <div className="mb-2 text-sm text-gray-600">
                回覆評論中...{" "}
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-blue-600 hover:underline"
                >
                  取消
                </button>
              </div>
            )}
            <Textarea
              placeholder="發表你的回覆..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                disabled={loading || !content.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "發送中..." : "回覆"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 評論列表 */}
      <div>
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>還沒有任何評論</p>
            <p className="text-sm mt-1">成為第一個發表評論的人！</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
            />
          ))
        )}
      </div>
    </div>
  )
}

