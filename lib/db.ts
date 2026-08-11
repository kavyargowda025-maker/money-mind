import { PrismaClient } from './prisma-client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DATABASE_URL (Port 6543 PgBouncer transaction pooler) for fast serverless queries
// Fall back to DIRECT_URL (Port 5432) if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || ''

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: Pool
}

// Managed Pool singleton with explicit connection limits
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
    keepAlive: true,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

const adapter = new PrismaPg(pool)

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
