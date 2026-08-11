import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-user'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
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

    const transactions = await db.transaction.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ transactions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
