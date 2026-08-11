'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowUpRight, ChevronDown, MoreHorizontal, Plus, Search, Trash2, ArrowDownRight, Loader2, Target } from 'lucide-react'
import { AddTransactionModal } from '@/components/add-transaction-modal'
import Link from 'next/link'

interface Transaction {
  id: string
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  description?: string
}

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string
}

export default function OverviewPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [userName, setUserName] = useState('User')
  const [currency, setCurrency] = useState('₹')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [txRes, goalsRes, settingsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/goals'),
        fetch('/api/settings'),
      ])

      const txData = await txRes.json()
      const goalsData = await goalsRes.json()
      const settingsData = await settingsRes.json()

      if (txData.transactions) setTransactions(txData.transactions)
      if (goalsData.goals) setGoals(goalsData.goals)
      if (settingsData.user) setUserName(settingsData.user.name || 'User')
      if (settingsData.settings) setCurrency(settingsData.settings.currency || '₹')
    } catch (e) {
      console.error('Failed to load dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteTx = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  // Derived Metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalBalance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0

  // Cash flow monthly distribution (last 12 months simulated relative to transactions)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonthIdx = new Date().getMonth()
  const displayMonths = Array.from({ length: 12 }, (_, i) => {
    const idx = (currentMonthIdx - 11 + i + 12) % 12
    return monthNames[idx]
  })

  const maxVal = Math.max(totalIncome, totalExpense, 10000)
  const incomeBarHeight = totalIncome > 0 ? Math.min(100, Math.round((totalIncome / maxVal) * 100)) : 10
  const expenseBarHeight = totalExpense > 0 ? Math.min(100, Math.round((totalExpense / maxVal) * 100)) : 10

  const filteredTransactions = transactions.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Welcome back, {userName}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Your money, made clear.</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" /> Add transaction
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary Metrics */}
          <section className="grid gap-4 md:grid-cols-3">
            <Metric
              label="Total balance"
              value={`${currency}${totalBalance.toLocaleString()}`}
              detail={totalBalance >= 0 ? 'Positive balance' : 'Negative balance'}
              positive={totalBalance >= 0}
            />
            <Metric
              label="Total spending"
              value={`${currency}${totalExpense.toLocaleString()}`}
              detail={`${transactions.filter((t) => t.type === 'EXPENSE').length} expenses logged`}
            />
            <Metric
              label="Savings rate"
              value={`${savingsRate}%`}
              detail={totalIncome > 0 ? `Income: ${currency}${totalIncome.toLocaleString()}` : 'No income recorded'}
              positive={savingsRate > 20}
            />
          </section>

          {/* Cash flow & Insights */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">Cash flow overview</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Income versus spending</p>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium">
                  Current Year <ChevronDown className="size-3" />
                </div>
              </div>
              <div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">
                {displayMonths.map((m, index) => {
                  const isCurrent = index === 11
                  const incH = isCurrent ? incomeBarHeight : Math.max(15, (index * 7) % 60)
                  const expH = isCurrent ? expenseBarHeight : Math.max(10, (index * 5) % 50)

                  return (
                    <div key={m + index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-40 w-full items-end gap-1">
                        <div
                          className="w-1/2 rounded-t-xs bg-primary transition-all"
                          style={{ height: `${incH}%` }}
                          title={`Income: ${currency}${totalIncome}`}
                        />
                        <div
                          className="w-1/2 rounded-t-xs bg-destructive/70 transition-all"
                          style={{ height: `${expH}%` }}
                          title={`Spending: ${currency}${totalExpense}`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{m}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-5 flex gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <i className="size-2.5 rounded-full bg-primary" />
                  Income ({currency}{totalIncome.toLocaleString()})
                </span>
                <span className="flex items-center gap-2">
                  <i className="size-2.5 rounded-full bg-destructive/70" />
                  Spending ({currency}{totalExpense.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Smart Insights */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-foreground p-6 text-background">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-background/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-background">
                    Financial Health
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-semibold leading-snug">
                  {totalBalance >= 0
                    ? `Great job! You have ${currency}${totalBalance.toLocaleString()} net surplus.`
                    : `Alert: Your spending exceeds income by ${currency}${Math.abs(totalBalance).toLocaleString()}.`}
                </h2>
                <p className="mt-3 text-sm leading-6 text-background/70">
                  {savingsRate > 0
                    ? `You are saving roughly ${savingsRate}% of your total income. Keep building your savings goals!`
                    : 'Add more income entries or optimize expenses to improve your savings rate.'}
                </p>
              </div>

              <Link
                href="/transactions"
                className="mt-6 flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline text-background"
              >
                View detailed transactions <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>

          {/* Recent Transactions & Goals */}
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Recent Transactions */}
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-semibold">Recent transactions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Your activity log</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
                    <Search className="size-3.5 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-24 bg-transparent text-xs outline-none placeholder:text-muted-foreground sm:w-32"
                    />
                  </div>
                  <Link
                    href="/transactions"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    View All
                  </Link>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-5 py-8 text-center">
                  <p className="text-sm font-medium">No transactions found</p>
                  <p className="text-xs text-muted-foreground">Click Add transaction to create your first entry.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredTransactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-9 items-center justify-center rounded-lg ${
                            tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                          }`}
                        >
                          {tx.type === 'INCOME' ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.category} • {new Date(tx.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600' : ''}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete transaction"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Goals summary */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">Financial Goals</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Progress toward target savings</p>
                </div>
                <Link href="/goals" className="text-xs font-medium text-primary hover:underline">
                  Manage goals
                </Link>
              </div>

              {goals.length === 0 ? (
                <div className="mt-7 rounded-lg border border-dashed border-border px-4 py-8 text-center">
                  <Target className="mx-auto size-6 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">No active goals</p>
                  <p className="mt-1 text-xs text-muted-foreground">Set target goals to build long-term savings.</p>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-4">
                  {goals.slice(0, 3).map((g) => {
                    const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
                    return (
                      <div key={g.id} className="rounded-lg border border-border bg-background p-3.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span>{g.title}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                          <span>Saved: {currency}{g.currentAmount.toLocaleString()}</span>
                          <span>Target: {currency}{g.targetAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onSuccess={fetchData} />}
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
  positive,
}: {
  label: string
  value: string
  detail: string
  positive?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-2 flex items-center gap-1 text-xs ${positive ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}`}>
        <ArrowUpRight className="size-3" />
        {detail}
      </p>
    </div>
  )
}
