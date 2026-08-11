import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({
        user: null,
        settings: { currency: '₹', monthlyBudget: 50000, theme: 'light' },
        unauthenticated: true,
      })
    }

    let settings = await withRetry(() =>
      db.userSettings.findUnique({
        where: { userId: user.id },
      })
    )

    if (!settings) {
      settings = await withRetry(() =>
        db.userSettings.create({
          data: {
            userId: user.id,
            currency: '₹',
            monthlyBudget: 50000,
            theme: 'light',
          },
        })
      )
    }

    return NextResponse.json({ user, settings })
  } catch (error: any) {
    console.error('API GET /settings error:', error)
    return NextResponse.json({ error: error?.message || 'Database query failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 })
    }

    const { currency, monthlyBudget, theme, name } = await req.json()

    // Execute user name update and settings upsert sequentially to avoid connection contention
    const updatedUser = name
      ? await withRetry(() =>
          db.user.update({
            where: { id: user.id },
            data: { name },
          })
        )
      : user

    const settings = await withRetry(() =>
      db.userSettings.upsert({
        where: { userId: user.id },
        update: {
          currency: currency !== undefined ? currency : undefined,
          monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
          theme: theme || undefined,
        },
        create: {
          userId: user.id,
          currency: currency || '₹',
          monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : 50000,
          theme: theme || 'light',
        },
      })
    )

    return NextResponse.json({ user: updatedUser, settings })
  } catch (error: any) {
    console.error('API POST /settings error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to save settings' }, { status: 500 })
  }
}
