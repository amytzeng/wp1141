"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Heart,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
  Trash,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow, format } from "date-fns"
import { zhTW } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { usePostUpdates } from "@/hooks/usePusher"

interface PostCardProps {
  post: any
  onDelete?: () => void
  showCommentPreview?: boolean
}

export default function PostCard({ post, onDelete, showCommentPreview = false }: PostCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post._count?.likes || post.likesCount || 0)
  const [reposted, setReposted] = useState(post.isReposted || false)
  const [repostsCount, setRepostsCount] = useState(post._count?.reposts || post.repostsCount || 0)
  const [commentsCount, setCommentsCount] = useState(post._count?.comments || post.commentsCount || 0)
  const [userInteracted, setUserInteracted] = useState(false) // 追蹤使用者是否有互動過
  const { subscribe } = usePostUpdates(post.id)

  const isOwner = session?.user?.id === post.authorId
  const createdAt = new Date(post.createdAt)
  const relativeTime = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: zhTW,
  })
  const exactDateTime = format(createdAt, "yyyy/MM/dd HH:mm")

  // 同步 props 變化到 state（但不覆蓋使用者的操作）
  useEffect(() => {
    if (!userInteracted) {
      setLiked(post.isLiked || false)
      setReposted(post.isReposted || false)
    }
  }, [post.isLiked, post.isReposted, userInteracted])
  
  // 當 post.id 改變時（切換到不同貼文），重置互動狀態
  useEffect(() => {
    setUserInteracted(false)
  }, [post.id])

  // Pusher: 監聽按讚更新
  useEffect(() => {
    const unsubscribeLike = subscribe("like-update", (data: any) => {
      if (data.userId !== session?.user?.id) {
        setLikesCount(data.likesCount)
      }
    })

    // Pusher: 監聽評論更新
    const unsubscribeComment = subscribe("new-comment", (data: any) => {
      setCommentsCount(data.commentsCount)
    })

    return () => {
      unsubscribeLike()
      unsubscribeComment()
    }
  }, [post.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const prevLiked = liked
    const prevCount = likesCount
    
    // 標記使用者已互動，防止 useEffect 覆蓋
    setUserInteracted(true)
    
    // 樂觀更新
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
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

  const handleRepost = async () => {
    const prevReposted = reposted
    const prevCount = repostsCount
    const wasReposted = reposted
    const isRepostedPost = post.isReposted // 判斷這是否為「轉發的貼文」（在個人頁面顯示的轉發內容）
    
    // 標記使用者已互動，防止 useEffect 覆蓋
    setUserInteracted(true)
    
    // 樂觀更新
    setReposted(!reposted)
    setRepostsCount(reposted ? repostsCount - 1 : repostsCount + 1)

    try {
      const res = await fetch(`/api/posts/${post.id}/repost`, {
        method: "POST",
      })

      if (res.ok) {
        // 如果是在個人頁面取消轉發一則「轉發的貼文」，刷新頁面移除該項目
        if (wasReposted && isRepostedPost) {
          router.refresh()
        }
      } else {
        // 回滾
        setReposted(prevReposted)
        setRepostsCount(prevCount)
      }
    } catch (error) {
      // 回滾
      setReposted(prevReposted)
      setRepostsCount(prevCount)
    }
  }

  const handleDelete = async () => {
    if (!confirm("確定要刪除這則貼文嗎？")) return

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        onDelete?.()
        router.refresh()
      }
    } catch (error) {
      console.error("刪除失敗:", error)
    }
  }

  // 渲染內容（處理 hashtags、mentions、links）
  const renderContent = (content: string) => {
    const parts = content.split(/(\s+)/)
    
    return parts.map((part, i) => {
      // Hashtag
      if (part.startsWith("#")) {
        return (
          <span key={i} className="text-blue-600 hover:underline cursor-pointer font-medium">
            {part}
          </span>
        )
      }
      // Mention
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
      // URL
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
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
         onClick={() => router.push(`/post/${post.id}`)}>
      {/* 如果是轉發的貼文，顯示轉發標記 */}
      {post.isReposted && (
        <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
          <Repeat2 className="h-4 w-4" />
          <span>轉發了</span>
        </div>
      )}
      
      <div className="flex gap-3">
        <Link href={`/profile/${post.author.userId}`} onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.image} />
            <AvatarFallback className="bg-blue-500 text-white">
              {post.author.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href={`/profile/${post.author.userId}`}
                className="font-semibold hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {post.author.name}
              </Link>
              <Link
                href={`/profile/${post.author.userId}`}
                className="text-gray-500 text-sm hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                @{post.author.userId}
              </Link>
              <span className="text-gray-500 text-sm">·</span>
              <div className="flex flex-col items-start">
                <span className="text-gray-500 text-sm whitespace-nowrap">
                  {relativeTime}
                </span>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {exactDateTime}
                </span>
              </div>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className="text-red-600"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="mt-1 text-gray-900 whitespace-pre-wrap break-words">
            {renderContent(post.content)}
          </div>

          <div className="flex items-center gap-8 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 -ml-2"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/post/${post.id}`)
              }}
            >
              <MessageCircle className="h-5 w-5 mr-1" />
              <span className="text-sm">{commentsCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!isOwner) {
                  handleRepost()
                }
              }}
              disabled={isOwner}
              className={`-ml-2 ${
                isOwner
                  ? "text-gray-300 cursor-not-allowed opacity-50"
                  : reposted
                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                  : "text-gray-500 hover:text-green-600 hover:bg-green-50"
              }`}
              title={isOwner ? "不能轉發自己的貼文" : ""}
            >
              <Repeat2 className="h-5 w-5 mr-1" />
              <span className="text-sm">{repostsCount}</span>
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
              <Heart
                className={`h-5 w-5 mr-1 ${liked ? "fill-current" : ""}`}
              />
              <span className="text-sm">{likesCount}</span>
            </Button>
          </div>

          {/* 留言預覽 */}
          {showCommentPreview && post.comments && post.comments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              {post.comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="flex gap-2 text-sm hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/comment/${comment.id}`)
                  }}
                >
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={comment.author.image} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                      {comment.author.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold truncate">{comment.author.name}</span>
                      <span className="text-gray-500">@{comment.author.userId}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: zhTW,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-900 line-clamp-2">{comment.content}</p>
                  </div>
                </div>
              ))}
              {commentsCount > 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/post/${post.id}`)
                  }}
                  className="text-blue-600 hover:underline text-sm pl-8"
                >
                  查看全部 {commentsCount} 則留言
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

