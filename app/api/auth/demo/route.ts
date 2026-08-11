import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  const demoId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const demoEmail = `demo_${Math.floor(Math.random() * 10000)}@moneymind.app`

  try {
    const user = await db.user.create({
      data: {
        id: demoId,
        email: demoEmail,
        name: 'Demo User',
        settings: {
          create: {
            currency: '₹',
            monthlyBudget: 50000,
            theme: 'light',
          },
        },
      },
    })

    // Run transaction, goal, and budget seeding concurrently for maximum performance
    await Promise.all([
      db.transaction.createMany({
        data: [
          {
            userId: user.id,
            title: 'Salary Income',
            amount: 85000,
            type: 'INCOME',
            category: 'Income',
            date: new Date(),
            description: 'Monthly payroll deposit',
          },
          {
            userId: user.id,
            title: 'Supermarket Provisions',
            amount: 4200,
            type: 'EXPENSE',
            category: 'Food',
            date: new Date(Date.now() - 86400000 * 2),
            description: 'Weekly grocery store',
          },
          {
            userId: user.id,
            title: 'Electric Grid Bill',
            amount: 1850,
            type: 'EXPENSE',
            category: 'Utilities',
            date: new Date(Date.now() - 86400000 * 5),
            description: 'Monthly power bill',
          },
        ],
      }),
      db.goal.createMany({
        data: [
          {
            userId: user.id,
            title: 'Emergency Fund',
            targetAmount: 150000,
            currentAmount: 45000,
            deadline: '2026-12-31',
            color: 'bg-emerald-500',
          },
          {
            userId: user.id,
            title: 'New Laptop',
            targetAmount: 120000,
            currentAmount: 30000,
            deadline: '2026-10-15',
            color: 'bg-blue-500',
          },
        ],
      }),
      db.budget.createMany({
        data: [
          { userId: user.id, category: 'Food', monthlyLimit: 15000 },
          { userId: user.id, category: 'Utilities', monthlyLimit: 5000 },
          { userId: user.id, category: 'Shopping', monthlyLimit: 10000 },
        ],
      }),
    ])

    const response = NextResponse.json({ success: true, user })
    response.cookies.set('demo_user_id', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    console.error('Demo auth creation error:', error)
    return NextResponse.json({ error: error?.message || 'Demo registration failed' }, { status: 500 })
  }
}
