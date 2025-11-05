import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PostCard from "@/components/post/PostCard"
import CommentSection from "@/components/post/CommentSection"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function PostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: {
          id: true,
          userId: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          reposts: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  // 檢查當前使用者是否已按讚和轉發
  let isLiked = false
  let isReposted = false
  
  if (session?.user?.id) {
    const [like, repost] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: params.id,
          },
        },
      }),
      prisma.repost.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: params.id,
          },
        },
      }),
    ])
    
    isLiked = !!like
    isReposted = !!repost
  }

  const postWithStatus = {
    ...post,
    isLiked,
    isReposted,
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-gray-200 p-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <button className="hover:bg-gray-100 rounded-full p-2 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h2 className="text-xl font-bold">貼文</h2>
        </div>
      </div>

      <PostCard post={postWithStatus} />

      {/* 評論區域 */}
      <CommentSection postId={params.id} />
    </div>
  )
}

