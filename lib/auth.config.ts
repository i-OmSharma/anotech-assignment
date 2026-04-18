import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register")
      const isDashboardPage =
        pathname.startsWith("/tasks") || pathname === "/"

      if (isDashboardPage) {
        if (isLoggedIn) return true
        return false // triggers redirect to signIn page
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/tasks", nextUrl))
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { id: string; role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: { strategy: "jwt" as const },
} satisfies NextAuthConfig
