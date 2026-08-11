import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'

export interface AppUser {
  id: string
  email: string
  name: string
}

export async function getCurrentUser(): Promise<AppUser> {
  const cookieStore = await cookies()
  const demoCookie = cookieStore.get('demo_user_id')?.value

  // 1. Try Supabase Auth session first
  try {
    const supabase = createClient(cookieStore)
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()

    if (supabaseUser && supabaseUser.email) {
      const dbUser = await db.user.upsert({
        where: { id: supabaseUser.id },
        update: {},
        create: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
          settings: {
            create: {
              currency: '₹',
              monthlyBudget: 50000,
              theme: 'light',
            },
          },
        },
      })

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || dbUser.email.split('@')[0],
      }
    }
  } catch (e) {
    // Supabase auth fallback
  }

  // 2. Try active Demo Cookie session
  if (demoCookie) {
    const existingDemoUser = await db.user.findUnique({
      where: { id: demoCookie },
    })

    if (existingDemoUser) {
      return {
        id: existingDemoUser.id,
        email: existingDemoUser.email,
        name: existingDemoUser.name || 'Demo User',
      }
    }
  }

  // 3. Fallback: Atomic upsert of stable guest session to guarantee active user without race conditions
  const fallbackId = demoCookie || 'default-guest-session'
  const fallbackEmail = demoCookie ? `${demoCookie}@moneymind.app` : 'guest@moneymind.app'

  const guestUser = await db.user.upsert({
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
}
