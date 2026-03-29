import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Skip if env vars are not set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Public routes that don't require auth
    const publicPaths = [
      '/',
      '/login',
      '/pin-login',
      '/forgot-password',
      '/reset-password',
      '/track',
      '/offline',
      '/api/auth/',   // PIN login + signout API routes
    ]
    const isPublicPath = publicPaths.some(path =>
      path === '/'
        ? request.nextUrl.pathname === '/'
        : request.nextUrl.pathname.startsWith(path)
    )

    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
  }

  return supabaseResponse
}
