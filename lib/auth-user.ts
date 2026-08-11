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

  // Check Supabase Auth session first
  try {
    const supabase = createClient(cookieStore)
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()

    if (supabaseUser && supabaseUser.email) {
      // Ensure user exists in Prisma DB
      const existingUser = await db.user.findUnique({
        where: { id: supabaseUser.id },
      })

      if (!existingUser) {
        const newUser = await db.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
          },
        })
        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || newUser.email.split('@')[0],
        }
      }

      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name || existingUser.email.split('@')[0],
      }
    }
  } catch (e) {
    // Supabase auth fallback
  }

  // Fallback: Demo user session
  const demoId = demoCookie || 'demo-user-default'
  const existingDemoUser = await db.user.findUnique({
    where: { id: demoId },
  })

  if (existingDemoUser) {
    return {
      id: existingDemoUser.id,
      email: existingDemoUser.email,
      name: existingDemoUser.name || 'Demo User',
    }
  }

  // Create default demo user if not created yet
  const newDemoUser = await db.user.create({
    data: {
      id: demoId,
      email: 'jordan@moneymind.app',
      name: 'Jordan Miller',
    },
  })

  return {
    id: newDemoUser.id,
    email: newDemoUser.email,
    name: newDemoUser.name || 'Jordan Miller',
  }
}
