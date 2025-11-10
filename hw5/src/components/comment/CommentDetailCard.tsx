"use client"

import { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { zhTW } from "date-fns/locale"

interface CommentDetailCardProps {
  comment: any
}

export default function CommentDetailCard({ comment }: CommentDetailCardProps) {
  const [liked, setLiked] = useState(comment.isLiked || false)
  const [likesCount, setLikesCount] = useState(comment._count?.likes || 0)
  const [repliesCount] = useState(comment._count?.replies || 0)

  const createdAt = new Date(comment.createdAt)
  const formattedDate = format(createdAt, "yyyy年MM月dd日 HH:mm", { locale: zhTW })

  const handleLike = async () => {
    const prevLiked = liked
    const prevCount = likesCount

    // 樂觀更新
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)

    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, {
        method: "POST",
      })

      if (!res.ok) {
        // 回滾
        setLiked(prevLiked)
        setLikesCount(prevCount)
      }
    } catch (error) {
      // 回滾
      setLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  return (
    <div className="border-b border-gray-200 p-6">
      {/* 作者資訊 */}
      <div className="flex items-start gap-3 mb-4">
        <Link href={`/profile/${comment.author.userId}`}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={comment.author.image} />
            <AvatarFallback className="bg-blue-500 text-white">
              {comment.author.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <Link href={`/profile/${comment.author.userId}`}>
            <p className="font-bold hover:underline">{comment.author.name}</p>
          </Link>
          <Link href={`/profile/${comment.author.userId}`}>
            <p className="text-gray-500 text-sm hover:underline">
              @{comment.author.userId}
            </p>
          </Link>
        </div>
      </div>

      {/* 留言內容 */}
      <div className="text-xl mb-4 whitespace-pre-wrap break-words">
        {comment.content}
      </div>

      {/* 時間 */}
      <div className="text-gray-500 text-sm mb-4 pb-4 border-b border-gray-200">
        {formattedDate}
      </div>

      {/* 統計數字 */}
      <div className="flex items-center gap-6 py-3 border-b border-gray-200 text-sm">
        <div>
          <span className="font-bold text-gray-900">{repliesCount}</span>
          <span className="text-gray-500 ml-1">回覆</span>
        </div>
        <div>
          <span className="font-bold text-gray-900">{likesCount}</span>
          <span className="text-gray-500 ml-1">喜歡</span>
        </div>
      </div>

      {/* 互動按鈕 */}
      <div className="flex items-center justify-around py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex-1"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex-1 ${
            liked
              ? "text-red-600 hover:text-red-700 hover:bg-red-50"
              : "text-gray-500 hover:text-red-600 hover:bg-red-50"
          }`}
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  )
}

