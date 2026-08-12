import { PrismaClient } from './prisma-client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// In serverless/Vercel production, use DATABASE_URL (Port 6543 PgBouncer transaction pooler)
// to multiplex concurrent serverless lambdas and prevent max-connection exhaustion on Supabase.
// In local development, fall back to DIRECT_URL (Port 5432).
const connectionString =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE_URL || process.env.DIRECT_URL || ''
    : process.env.DIRECT_URL || process.env.DATABASE_URL || ''

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: Pool
}

// Serverless-optimized connection pool settings: max 2 connections per lambda instance in prod
const isProd = process.env.NODE_ENV === 'production'

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: isProd ? 2 : 5,
    idleTimeoutMillis: isProd ? 1000 : 5000,
    connectionTimeoutMillis: 10000,
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
 * Utility to execute DB operations with automatic retry on transient pool/socket timeouts.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: any
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      lastError = err
      const errMsg = err?.message || String(err)
      const isTimeout =
        errMsg.includes('timed out') ||
        errMsg.includes('timeout') ||
        errMsg.includes('Connection terminated') ||
        errMsg.includes('closed unexpectedly') ||
        errMsg.includes('ECONNRESET') ||
        errMsg.includes('ETIMEDOUT') ||
        errMsg.includes('too many clients') ||
        errMsg.includes('connection limit exceeded')

      if (!isTimeout || attempt === retries - 1) {
        throw err
      }
      console.warn(`[DB Retry] Transient database error on attempt ${attempt + 1}/${retries}: ${errMsg}. Retrying query...`)
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
    }
  }
  throw lastError
}
