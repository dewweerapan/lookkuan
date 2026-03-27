import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Server-side sign out — clears auth cookies properly
export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Server signout error:', err)
  }

  // Always redirect to login, even if signOut fails
  const response = NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    { status: 303 }
  )

  // Explicitly clear all Supabase auth cookies
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1]}-auth-token`,
  ]
  cookiesToClear.forEach(name => {
    response.cookies.set(name, '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
  })

  return response
}
