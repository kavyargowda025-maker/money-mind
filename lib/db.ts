import { PrismaClient } from './prisma-client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Use DATABASE_URL for runtime query execution via transaction pooler
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || ''

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: Pool
}

// Managed Pool singleton with explicit serverless timeout controls
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10, // Maximum pool size per serverless container
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Connection acquisition timeout 5s
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

const adapter = new PrismaPg(pool)

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
