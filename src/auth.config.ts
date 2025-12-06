import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyCredentials } from '@/lib/auth'

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await verifyCredentials(
          credentials.email as string,
          credentials.password as string
        )

        return user
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tenantId = user.tenantId
        token.role = user.role
        token.tenant = user.tenant
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as number
        session.user.tenantId = token.tenantId as number
        session.user.role = token.role as string
        session.user.tenant = token.tenant as any
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig
