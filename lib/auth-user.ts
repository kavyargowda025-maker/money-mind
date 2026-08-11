import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'

export interface AppUser {
  id: string
  email: string
  name: string
}

export async function getCurrentUser(): Promise<AppUser | null> {
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

  // Return null cleanly if no session active - NO implicit database writes on read queries
  return null
}
