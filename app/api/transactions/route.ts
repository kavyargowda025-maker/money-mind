import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ transactions: [], unauthenticated: true })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''

    const whereClause: any = {
      userId: user.id,
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (category && category !== 'ALL') {
      whereClause.category = category
    }

    if (type && type !== 'ALL') {
      whereClause.type = type
    }

    const [transactions, userSettings] = await Promise.all([
      db.transaction.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        take: 100,
      }),
      db.userSettings.findUnique({
        where: { userId: user.id },
      }),
    ])

    return NextResponse.json({
      transactions,
      currency: userSettings?.currency || '₹',
    })
  } catch (error: any) {
    console.error('API GET /transactions error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 })
    }

    const body = await req.json()
    const { title, amount, type, category, date, description } = body

    if (!title || !amount || !type || !category) {
      return NextResponse.json({ error: 'Missing required transaction fields' }, { status: 400 })
    }

    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date) : new Date(),
        description: description || null,
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error: any) {
    console.error('API POST /transactions error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to save transaction' }, { status: 500 })
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
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    await db.transaction.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API DELETE /transactions error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to delete transaction' }, { status: 500 })
  }
}
