import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({
        user: null,
        transactions: [],
        goals: [],
        settings: { currency: '₹', monthlyBudget: 50000, theme: 'light' },
        unauthenticated: true,
      })
    }

    const [transactions, goals, userSettings] = await Promise.all([
      db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: 100,
      }),
      db.goal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
      db.userSettings.findUnique({
        where: { userId: user.id },
      }),
    ])

    const settings = userSettings || {
      currency: '₹',
      monthlyBudget: 50000,
      theme: 'light',
    }

    return NextResponse.json({
      user,
      transactions,
      goals,
      settings,
    })
  } catch (error: any) {
    console.error('API GET /dashboard error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to load dashboard data' }, { status: 500 })
  }
}
