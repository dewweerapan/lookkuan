'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

const ROLE_CACHE_KEY = 'lk_user_role'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  // Start with cached role from localStorage so menus render instantly on refresh
  const [cachedRole, setCachedRole] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ROLE_CACHE_KEY)
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchProfile = async (userId: string) => {
      // Strategy 1: Try direct table query
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profileError && profileData) {
        setProfile(profileData)
        // Cache the role for instant render on next refresh
        localStorage.setItem(ROLE_CACHE_KEY, profileData.role)
        setCachedRole(profileData.role)
        return
      }

      console.warn('Direct profile fetch failed, trying RPC...', profileError?.message)

      // Strategy 2: Use SECURITY DEFINER function (bypasses RLS)
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role')

      if (!roleError && roleData) {
        const syntheticProfile = { id: userId, role: roleData } as Profile
        setProfile(syntheticProfile)
        localStorage.setItem(ROLE_CACHE_KEY, roleData)
        setCachedRole(roleData)
        return
      }

      console.error('RPC get_user_role also failed:', roleError?.message)
      // Both failed — keep cachedRole from localStorage so menus stay visible
    }

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          await fetchProfile(user.id)
        } else {
          // Logged out — clear cache
          localStorage.removeItem(ROLE_CACHE_KEY)
          setCachedRole(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          localStorage.removeItem(ROLE_CACHE_KEY)
          setCachedRole(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('SignOut error:', err)
    } finally {
      localStorage.removeItem(ROLE_CACHE_KEY)
      window.location.replace('/login')
    }
  }

  // Use profile.role if loaded, otherwise fall back to cachedRole
  const effectiveRole = profile?.role ?? cachedRole

  const hasRole = (roles: string | string[]): boolean => {
    if (!effectiveRole) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(effectiveRole)
  }

  return { user, profile, loading, signOut, hasRole }
}
