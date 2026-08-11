import { PrismaClient } from './prisma-client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use transaction pooler (DATABASE_URL) for runtime serverless queries
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || ''

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient() {
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pool = pool
  }

  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
