import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { db, withRetry } from '@/lib/db'

import { cache } from 'react'

export interface AppUser {
  id: string
  email: string
  name: string
}

export const getCurrentUser = cache(async (): Promise<AppUser> => {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const demoCookie = cookieStore.get('demo_user_id')?.value

  // Check if any Supabase auth cookies exist before making external auth API call
  const hasSupabaseAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
  )

  // 1. Try Supabase Auth session only if auth cookies are present
  if (hasSupabaseAuthCookie) {
    try {
      const supabase = createClient(cookieStore)
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser()

      if (supabaseUser && supabaseUser.email) {
        const userEmail = supabaseUser.email
        const dbUser = await withRetry(() =>
          db.user.upsert({
            where: { id: supabaseUser.id },
            update: {},
            create: {
              id: supabaseUser.id,
              email: userEmail,
              name: supabaseUser.user_metadata?.full_name || userEmail.split('@')[0],
              settings: {
                create: {
                  currency: '₹',
                  monthlyBudget: 50000,
                  theme: 'light',
                },
              },
            },
          })
        )

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || userEmail.split('@')[0],
        }
      }
    } catch (e) {
      // Supabase auth fallback
    }
  }

  // 2. Try active Demo Cookie session
  if (demoCookie) {
    try {
      const existingDemoUser = await withRetry(() =>
        db.user.findUnique({
          where: { id: demoCookie },
        })
      )

      if (existingDemoUser) {
        return {
          id: existingDemoUser.id,
          email: existingDemoUser.email,
          name: existingDemoUser.name || 'Demo User',
        }
      }
    } catch (e) {
      console.warn('[auth-user] Error reading demoCookie user, falling through:', e)
    }
  }

  // 3. Fallback: Fast-path findUnique check before upsert to eliminate multi-statement transaction contention
  const fallbackId = demoCookie || 'default-guest-session'
  const fallbackEmail = demoCookie ? `${demoCookie}@moneymind.app` : 'guest@moneymind.app'

  try {
    const existingFallbackUser = await withRetry(() =>
      db.user.findUnique({
        where: { id: fallbackId },
      })
    )

    if (existingFallbackUser) {
      return {
        id: existingFallbackUser.id,
        email: existingFallbackUser.email,
        name: existingFallbackUser.name || 'Jordan Miller',
      }
    }
  } catch (e) {
    console.warn('[auth-user] Error reading fallback user:', e)
  }

  const guestUser = await withRetry(() =>
    db.user.upsert({
      where: { id: fallbackId },
      update: {},
      create: {
        id: fallbackId,
        email: fallbackEmail,
        name: 'Jordan Miller',
        settings: {
          create: {
            currency: '₹',
            monthlyBudget: 50000,
            theme: 'light',
          },
        },
      },
    })
  )

  // Set cookie for session persistence
  try {
    cookieStore.set('demo_user_id', guestUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    })
  } catch (e) {
    // Server component cookie set warning ignorable
  }

  return {
    id: guestUser.id,
    email: guestUser.email,
    name: guestUser.name || 'Jordan Miller',
  }
})
