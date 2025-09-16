import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured for use with middleware
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })
  
  try {
    // Refresh session if exists
    await supabase.auth.getSession()

    // Get the latest session state
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) throw error

    // Allow auth callback route without authentication
    if (request.nextUrl.pathname === '/auth/callback') {
      return response
    }

    // Check if user is trying to access auth pages while logged in
    if (session) {
      if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }
    
    // If no session and trying to access protected routes, redirect to login
    if (!session && 
      !request.nextUrl.pathname.startsWith('/_next') &&
      !request.nextUrl.pathname.startsWith('/api') &&
      !request.nextUrl.pathname.startsWith('/ingest') &&
      request.nextUrl.pathname !== '/login' &&
      request.nextUrl.pathname !== '/signup' &&
      request.nextUrl.pathname !== '/' &&
      !request.nextUrl.pathname.includes('.')
    ) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    console.error('Auth error:', error)
    // Clear any invalid session state
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ["/((?!.+\.[\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

