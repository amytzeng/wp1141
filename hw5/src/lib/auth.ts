import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import FacebookProvider from "next-auth/providers/facebook"
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
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
  ].filter(provider => {
    // 只加入有設定的 provider
    const config = provider.options as any
    return config.clientId && config.clientSecret
  }),
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false
      
      try {
        const existingUser = await prisma.user.findFirst({
          where: {
            provider: account.provider,
            providerId: account.providerAccountId,
          },
        })

        if (!existingUser && user.email) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || '',
              image: user.image || '',
              provider: account.provider,
              providerId: account.providerAccountId,
            },
          })
        }

        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
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

