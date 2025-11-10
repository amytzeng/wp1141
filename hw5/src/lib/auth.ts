import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ].filter(provider => {
    // 只加入有設定的 provider
    const config = provider.options as any
    return config.clientId && config.clientSecret
  }),
  callbacks: {
    async signIn({ user, account }) {
      if (!account) {
        console.error('No account provided')
        return false
      }
      
      try {
        console.log('Attempting sign in:', {
          provider: account.provider,
          email: user.email,
        })

        const existingUser = await prisma.user.findFirst({
          where: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })

        if (!existingUser) {
          console.log('Creating new user')
          
          // GitHub 可能不提供 email，使用 providerId 作為唯一標識
          const email = user.email || `${account.providerAccountId}@${account.provider}.placeholder`
          
          await prisma.user.create({
            data: {
              email: email,
              name: user.name || account.provider,
              image: user.image || '',
              provider: account.provider,
              providerId: account.providerAccountId,
            },
          })
          console.log('User created successfully')
        } else {
          console.log('Existing user found')
        }

        return true
      } catch (error) {
        console.error('Sign in error:', error)
        // 即使資料庫錯誤也嘗試讓用戶登入
        // 在 session callback 會再次嘗試
        return true
      }
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: { 
              email: session.user.email!,
            },
          })
          
          if (dbUser) {
            session.user.id = dbUser.id
            session.user.userId = dbUser.userId
          }
        } catch (error) {
          console.error('Session error:', error)
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

