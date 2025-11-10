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

  // 取得使用者的貼文（包含自己發的和轉發的）
  const ownPosts = await prisma.post.findMany({
    where: { authorId: user.id },
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

  // 取得使用者轉發的貼文
  const reposts = await prisma.repost.findMany({
    where: { userId: user.id },
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
  })

  // 合併貼文和轉發，標記轉發的貼文
  const repostedPosts = reposts.map(r => ({
    ...r.post,
    isReposted: true,
    repostedAt: r.createdAt,
  }))

  const allPosts = [...ownPosts, ...repostedPosts]
    .sort((a, b) => {
      const timeA = 'repostedAt' in a ? new Date(a.repostedAt).getTime() : new Date(a.createdAt).getTime()
      const timeB = 'repostedAt' in b ? new Date(b.repostedAt).getTime() : new Date(b.createdAt).getTime()
      return timeB - timeA
    })
    .slice(0, 20)

  const posts = allPosts

  // 如果是本人，取得按讚的貼文
  let likedPosts: any[] = []
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

  // 檢查當前使用者對這些貼文的按讚和轉發狀態
  let postsWithStatus = posts
  let likedPostsWithStatus = likedPosts
  
  if (session?.user?.id) {
    const postIds = [...posts.map(p => p.id), ...likedPosts.map(p => p.id)]
    
    // 檢查按讚
    const userLikes = await prisma.like.findMany({
      where: {
        userId: session.user.id,
        postId: { in: postIds },
      },
      select: { postId: true },
    })
    
    // 檢查轉發
    const userReposts = await prisma.repost.findMany({
      where: {
        userId: session.user.id,
        postId: { in: postIds },
      },
      select: { postId: true },
    })
    
    const likedPostIds = new Set(userLikes.map(l => l.postId).filter((id): id is string => id !== null))
    const repostedPostIds = new Set(userReposts.map(r => r.postId).filter((id): id is string => id !== null))
    
    postsWithStatus = posts.map(post => ({
      ...post,
      isLiked: post.id ? likedPostIds.has(post.id) : false,
      isReposted: post.id ? (repostedPostIds.has(post.id) || post.isReposted) : false, // 保留原有的 isReposted 標記（來自 Repost table）
    }))

    likedPostsWithStatus = likedPosts.map((post: any) => ({
      ...post,
      isLiked: post.id ? likedPostIds.has(post.id) : false,
      isReposted: post.id ? repostedPostIds.has(post.id) : false,
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
        posts={postsWithStatus}
        likedPosts={likedPostsWithStatus}
        isOwnProfile={isOwnProfile}
      />
    </div>
  )
}

