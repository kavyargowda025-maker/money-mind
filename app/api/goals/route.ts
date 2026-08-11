import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ goals })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { title, targetAmount, currentAmount, deadline, color } = await req.json()

    if (!title || !targetAmount) {
      return NextResponse.json({ error: 'Title and target amount are required' }, { status: 400 })
    }

    const goal = await db.goal.create({
      data: {
        userId: user.id,
        title,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline: deadline || null,
        color: color || 'bg-primary',
      },
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { id, depositAmount } = await req.json()

    if (!id || depositAmount === undefined) {
      return NextResponse.json({ error: 'Goal ID and deposit amount are required' }, { status: 400 })
    }

    const existingGoal = await db.goal.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    const updatedGoal = await db.goal.update({
      where: { id },
      data: {
        currentAmount: Math.min(
          existingGoal.targetAmount,
          existingGoal.currentAmount + parseFloat(depositAmount)
        ),
      },
    })

    return NextResponse.json({ goal: updatedGoal })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    await db.goal.deleteMany({
      where: { id, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
