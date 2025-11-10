import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import CommentDetailCard from "@/components/comment/CommentDetailCard"
import CommentReplySection from "@/components/comment/CommentReplySection"

async function getComment(id: string) {
  const res = await fetch(`http://localhost:3000/api/comments/${id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  const data = await res.json()
  return data.comment
}

export default async function CommentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (!session.user.userId) {
    redirect("/register")
  }

  const comment = await getComment(params.id)

  if (!comment) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* 標題欄 */}
      <div className="border-b border-gray-200 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Link href={`/post/${comment.postId}`}>
            <button className="hover:bg-gray-100 rounded-full p-2 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h2 className="text-xl font-bold">留言</h2>
        </div>
      </div>

      {/* 原始貼文預覽（如果這是對貼文的留言） */}
      {comment.post && !comment.parentId && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <Link href={`/post/${comment.postId}`}>
            <div className="flex gap-3 hover:bg-gray-100 p-3 rounded-lg transition-colors">
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">回覆 @{comment.post.author.userId} 的貼文</p>
                <p className="mt-1 text-gray-700 line-clamp-2">{comment.post.content}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 如果這是對留言的回覆，顯示父留言 */}
      {comment.parent && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <Link href={`/comment/${comment.parentId}`}>
            <div className="flex gap-3 hover:bg-gray-100 p-3 rounded-lg transition-colors">
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">回覆 @{comment.parent.author.userId} 的留言</p>
                <p className="mt-1 text-gray-700 line-clamp-2">{comment.parent.content}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 留言詳細內容 */}
      <CommentDetailCard comment={comment} />

      {/* 回覆區域 */}
      <CommentReplySection commentId={params.id} />
    </div>
  )
}

