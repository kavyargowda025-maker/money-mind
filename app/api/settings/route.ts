import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    let settings = await db.userSettings.findUnique({
      where: { userId: user.id },
    })

    if (!settings) {
      settings = await db.userSettings.create({
        data: {
          userId: user.id,
          currency: '₹',
          monthlyBudget: 50000,
          theme: 'light',
        },
      })
    }

    return NextResponse.json({ user, settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { currency, monthlyBudget, theme, name } = await req.json()

    if (name) {
      await db.user.update({
        where: { id: user.id },
        data: { name },
      })
    }

    const settings = await db.userSettings.upsert({
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

    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
