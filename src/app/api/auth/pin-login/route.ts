import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { pin } = await request.json()

  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: 'PIN ไม่ถูกต้อง' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // Use service role to bypass RLS
  const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Look up user by PIN
  const { data: profile, error: lookupError } = await admin
    .from('profiles')
    .select('id, email, role')
    .eq('pin_code', pin)
    .eq('is_active', true)
    .single()

  if (lookupError || !profile) {
    return NextResponse.json({ error: 'รหัส PIN ไม่ถูกต้อง' }, { status: 401 })
  }

  // Generate a one-time magic link token for this user
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: profile.email,
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('generateLink error:', linkError)
    return NextResponse.json({ error: 'ไม่สามารถสร้าง session ได้' }, { status: 500 })
  }

  // Exchange the token for a real session and set cookies on response
  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'email',
  })

  if (verifyError) {
    console.error('verifyOtp error:', verifyError)
    return NextResponse.json({ error: 'ไม่สามารถยืนยัน session ได้' }, { status: 500 })
  }

  return response
}
