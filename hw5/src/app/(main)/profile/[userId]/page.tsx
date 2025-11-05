import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileTabs from "@/components/profile/ProfileTabs"

export default async function ProfilePage({ 
  params 
}: { 
  params: { userId: string } 
}) {
  const session = await getServerSession(authOptions)
  
  // 取得使用者資料
  const user = await prisma.user.findUnique({
    where: { userId: params.userId },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  // 檢查是否為本人
  const isOwnProfile = session?.user?.userId === params.userId

  // 如果不是本人，檢查是否已關注
  let isFollowing = false
  if (!isOwnProfile && session?.user?.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    })
    isFollowing = !!follow
  }

  // 取得使用者的貼文
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
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

  // 如果是本人，取得按讚的貼文
  let likedPosts = []
  if (isOwnProfile) {
    const likes = await prisma.like.findMany({
      where: { 
        userId: user.id,
        postId: { not: null },
      },
      include: {
        post: {
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
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    likedPosts = likes.map(like => like.post).filter(Boolean)
  }

  // 檢查當前使用者對這些貼文的按讚狀態
  let postsWithLikeStatus = posts
  let likedPostsWithStatus = likedPosts
  
  if (session?.user?.id) {
    const postIds = [...posts.map(p => p.id), ...likedPosts.map(p => p.id)]
    const userLikes = await prisma.like.findMany({
      where: {
        userId: session.user.id,
        postId: { in: postIds },
      },
      select: { postId: true },
    })
    
    const likedPostIds = new Set(userLikes.map(l => l.postId))
    
    postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }))

    likedPostsWithStatus = likedPosts.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }))
  }

  return (
    <div className="min-h-screen">
      <ProfileHeader 
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        postsCount={user._count.posts}
        followersCount={user._count.followers}
        followingCount={user._count.following}
      />
      
      <ProfileTabs
        posts={postsWithLikeStatus}
        likedPosts={likedPostsWithStatus}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}

