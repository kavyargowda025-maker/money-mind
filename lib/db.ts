import { PrismaClient } from './prisma-client/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Use DATABASE_URL for query execution (transaction pooler)
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || ''

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const adapter = new PrismaPg({
    connectionString,
  })

  const client = new PrismaClient({ adapter })
  globalForPrisma.prisma = client
  return client
}

export const db = getPrismaClient()
