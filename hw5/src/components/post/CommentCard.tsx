"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"

interface CommentCardProps {
  comment: any
  postId: string
  onReply?: (commentId: string) => void
}

export default function CommentCard({ comment, postId, onReply }: CommentCardProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(comment.isLiked || false)
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const prevLiked = liked
    const prevCount = likesCount
    
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)

    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, {
        method: "POST",
      })

      if (!res.ok) {
        setLiked(prevLiked)
        setLikesCount(prevCount)
      }
    } catch (error) {
      setLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  const renderContent = (content: string) => {
    const parts = content.split(/(\s+)/)
    
    return parts.map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <span key={i} className="text-blue-600 hover:underline cursor-pointer font-medium">
            {part}
          </span>
        )
      }
      if (part.startsWith("@")) {
        const userId = part.slice(1)
        return (
          <Link
            key={i}
            href={`/profile/${userId}`}
            className="text-blue-600 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        )
      }
      if (part.match(/^https?:\/\//)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-3">
        <Link href={`/profile/${comment.author.userId}`} onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.image} />
            <AvatarFallback className="bg-blue-500 text-white">
              {comment.author.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${comment.author.userId}`}
              className="font-semibold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {comment.author.name}
            </Link>
            <Link
              href={`/profile/${comment.author.userId}`}
              className="text-gray-500 text-sm hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              @{comment.author.userId}
            </Link>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: zhTW,
              })}
            </span>
          </div>

          <div className="mt-1 text-gray-900 whitespace-pre-wrap break-words">
            {renderContent(comment.content)}
          </div>

          <div className="flex items-center gap-6 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 -ml-2"
              onClick={(e) => {
                e.stopPropagation()
                onReply?.(comment.id)
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">{comment.commentsCount || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`-ml-2 ${
                liked 
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                  : "text-gray-500 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
              <span className="text-sm">{likesCount}</span>
            </Button>
          </div>

          {/* 遞迴顯示回覆 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 border-l-2 border-gray-200 pl-4 space-y-3">
              {comment.replies.map((reply: any) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

