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
      // Atomic upsert in 1 query instead of findUnique + create
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

  // 3. Fallback: Create a new separate guest account per unique session
  const newGuestId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const newGuestEmail = `user_${Math.floor(Math.random() * 10000)}@moneymind.app`

  const newGuest = await db.user.create({
    data: {
      id: newGuestId,
      email: newGuestEmail,
      name: 'Guest User',
      settings: {
        create: {
          currency: '₹',
          monthlyBudget: 50000,
          theme: 'light',
        },
      },
    },
  })

  // Set cookie for new session
  try {
    cookieStore.set('demo_user_id', newGuest.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    })
  } catch (e) {
    // Server component cookie warning ignorable
  }

  return {
    id: newGuest.id,
    email: newGuest.email,
    name: newGuest.name || 'Guest User',
  }
}
