import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ budgets: [], spendingByCategory: {}, unauthenticated: true })
    }

    // Fetch budgets and expense transactions in parallel
    const [budgets, transactions] = await Promise.all([
      db.budget.findMany({
        where: { userId: user.id },
        orderBy: { category: 'asc' },
      }),
      db.transaction.findMany({
        where: {
          userId: user.id,
          type: 'EXPENSE',
        },
      }),
    ])

    const spendingByCategory: Record<string, number> = {}
    transactions.forEach((tx) => {
      spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount
    })

    const result = budgets.map((b) => ({
      ...b,
      spent: spendingByCategory[b.category] || 0,
    }))

    return NextResponse.json({ budgets: result, spendingByCategory })
  } catch (error: any) {
    console.error('API GET /budgets error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch budgets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 })
    }

    const { category, monthlyLimit } = await req.json()

    if (!category || !monthlyLimit) {
      return NextResponse.json({ error: 'Category and limit are required' }, { status: 400 })
    }

    const budget = await db.budget.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category,
        },
      },
      update: {
        monthlyLimit: parseFloat(monthlyLimit),
      },
      create: {
        userId: user.id,
        category,
        monthlyLimit: parseFloat(monthlyLimit),
      },
    })

    return NextResponse.json({ budget })
  } catch (error: any) {
    console.error('API POST /budgets error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to save budget' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
    }

    await db.budget.deleteMany({
      where: { id, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API DELETE /budgets error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to delete budget' }, { status: 500 })
  }
}
