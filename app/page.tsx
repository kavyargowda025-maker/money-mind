'use client'

import { useState } from 'react'
import { ArrowUpRight, ChevronDown, MoreHorizontal, Plus, Search } from 'lucide-react'
import { AddTransactionModal } from '@/components/add-transaction-modal'

const bars = Array.from({ length: 12 }, () => 0)

export default function OverviewPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Good morning, Jordan</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Your money, made clear.</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            <Plus className="size-4" />Add transaction
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Total balance" value="₹0.00" detail="Add a transaction to get started" />
        <Metric label="Monthly spending" value="₹0.00" detail="No spending recorded" />
        <Metric label="Savings rate" value="0%" detail="No income recorded" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Cash flow</h2>
              <p className="mt-1 text-sm text-muted-foreground">Income versus spending over the last 12 months</p>
            </div>
            <button className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium">
              Last 12 months <ChevronDown className="size-3" />
            </button>
          </div>
          <div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">
            {bars.map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end gap-1">
                  <div className="w-1/2 rounded-t-sm bg-primary/80" style={{ height: `${height}%` }} />
                  <div className="w-1/2 rounded-t-sm bg-accent" style={{ height: `${Math.max(height - 20, 18)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-primary" />Income</span>
            <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-accent" />Spending</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-primary p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10"></div>
            <span className="rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">Spending trend</span>
          </div>
          <h2 className="mt-8 max-w-xs text-xl font-semibold leading-snug">Your spending insights will appear here.</h2>
          <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/70">Add transactions to see personalized trends and summaries.</p>
          <button onClick={() => setShowAdd(true)} className="mt-8 flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
            Add a transaction <ArrowUpRight className="size-4" />
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
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
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-5 py-8 text-center sm:px-6">
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs text-muted-foreground">Add your first transaction to start tracking your money.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Goals</h2>
              <p className="mt-1 text-sm text-muted-foreground">Keep your eye on the future</p>
            </div>
            <button className="text-xs font-medium text-muted-foreground hover:text-foreground">View all</button>
          </div>
          <div className="mt-7 rounded-lg border border-dashed border-border px-4 py-5 text-center">
            <p className="text-sm font-medium">No goals yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Create a goal to start building toward it.</p>
          </div>
        </div>
      </section>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function Metric({ label, value, detail, positive }: { label: string; value: string; detail: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-2 flex items-center gap-1 text-xs ${positive ? 'text-primary' : 'text-muted-foreground'}`}>
        <ArrowUpRight className="size-3" />{detail}
      </p>
    </div>
  )
}
