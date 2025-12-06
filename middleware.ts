import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Protect dashboard and API routes (except auth and webhooks)
  if (!isPublicRoute && !isLoggedIn) {
    if (pathname.startsWith('/api/')) {
      // API routes return 401
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Redirect to login for dashboard routes
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
