import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db, withRetry } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ goals: [], unauthenticated: true })
    }

    const [goals, userSettings] = await Promise.all([
      withRetry(() =>
        db.goal.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        })
      ),
      withRetry(() =>
        db.userSettings.findUnique({
          where: { userId: user.id },
        })
      ),
    ])

    return NextResponse.json({
      goals,
      currency: userSettings?.currency || '₹',
    })
  } catch (error: any) {
    console.error('API GET /goals error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 })
    }

    const { title, targetAmount, currentAmount, deadline, color } = await req.json()

    if (!title || !targetAmount) {
      return NextResponse.json({ error: 'Title and target amount are required' }, { status: 400 })
    }

    const goal = await withRetry(() =>
      db.goal.create({
        data: {
          userId: user.id,
          title,
          targetAmount: parseFloat(targetAmount),
          currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
          deadline: deadline || null,
          color: color || 'bg-primary',
        },
      })
    )

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error: any) {
    console.error('API POST /goals error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create goal' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 })
    }

    const { id, depositAmount } = await req.json()

    if (!id || depositAmount === undefined) {
      return NextResponse.json({ error: 'Goal ID and deposit amount are required' }, { status: 400 })
    }

    const existingGoal = await withRetry(() =>
      db.goal.findFirst({
        where: { id, userId: user.id },
      })
    )

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const updatedGoal = await withRetry(() =>
      db.goal.update({
        where: { id },
        data: {
          currentAmount: Math.min(
            existingGoal.targetAmount,
            existingGoal.currentAmount + parseFloat(depositAmount)
          ),
        },
      })
    )

    return NextResponse.json({ goal: updatedGoal })
  } catch (error: any) {
    console.error('API PATCH /goals error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to deposit funds' }, { status: 500 })
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
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    await withRetry(() =>
      db.goal.deleteMany({
        where: { id, userId: user.id },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API DELETE /goals error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to delete goal' }, { status: 500 })
  }
}
