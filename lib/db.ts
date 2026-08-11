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

// Managed Pool singleton with explicit connection limits & keepalive
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 30000,
    keepAlive: true,
  })

// Evict dead idle clients from the pool automatically on network drop
pool.on('error', (err) => {
  console.error('[pg pool] Idle client socket error:', err.message || err)
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

const adapter = new PrismaPg(pool)

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * Utility to execute DB operations with automatic single-retry on transient pool/socket timeouts.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: any
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      const isTimeout =
        err?.message?.includes('timed out') ||
        err?.message?.includes('timeout') ||
        err?.message?.includes('Connection terminated')
      if (!isTimeout || attempt === retries - 1) {
        throw err
      }
      console.warn(`[DB Retry] Transient timeout on attempt ${attempt + 1}. Retrying query...`)
      await new Promise((r) => setTimeout(r, 200))
    }
  }
  throw lastError
}
