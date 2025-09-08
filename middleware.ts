import { NextRequest, NextResponse } from 'next/server'
import { getSession } from './lib/session'

const publicOnlyUrls = ['/admin/signup', '/admin/signin']

export async function middleware(request: NextRequest) {
  const session = await getSession()
  const isUserLoggedIn = 'id' in session
  const isAdminRoot = request.nextUrl.pathname === '/admin'
  const isPublicOnlyUrl = publicOnlyUrls.includes(request.nextUrl.pathname)

  if (isUserLoggedIn) {
    if (isPublicOnlyUrl || isAdminRoot) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  } else {
    if (!isPublicOnlyUrl || isAdminRoot) {
      return NextResponse.redirect(new URL('/admin/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
