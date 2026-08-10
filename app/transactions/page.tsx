'use client'

import { useState } from 'react'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { AddTransactionModal } from '@/components/add-transaction-modal'

export default function TransactionsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Transactions</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">All your transactions.</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            <Plus className="size-4" />Add transaction
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold">Recent transactions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Your latest activity</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5 sm:flex">
              <Search className="size-3.5 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="w-24 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
            </div>
            <button className="rounded-md p-2 text-muted-foreground hover:bg-muted"><MoreHorizontal className="size-4" /></button>
          </div>
        </div>
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-5 py-8 text-center sm:px-6">
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs text-muted-foreground">Add your first transaction to start tracking your money.</p>
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
