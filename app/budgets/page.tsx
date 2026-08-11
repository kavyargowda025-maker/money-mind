'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react'

interface Budget {
  id: string
  category: string
  monthlyLimit: number
  spent: number
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currency, setCurrency] = useState('₹')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Add/Edit form
  const [category, setCategory] = useState('Food')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/budgets')
      const data = await res.json()

      if (data.budgets) setBudgets(data.budgets)
      if (data.currency) setCurrency(data.currency)
    } catch (e) {
      console.error('Failed to load budgets:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !monthlyLimit) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, monthlyLimit }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save budget')

      setShowAddModal(false)
      setMonthlyLimit('')
      fetchBudgets()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to remove this category budget?')) return
    await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' })
    fetchBudgets()
  }

  const totalLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0)
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0)

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Budgets</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Manage your spending limits</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" /> Set category budget
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Monthly Budget</p>
          <p className="mt-2 text-2xl font-semibold">{currency}{totalLimit.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Category Spending</p>
          <p className="mt-2 text-2xl font-semibold">{currency}{totalSpent.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium">No budgets created yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Set spending caps for categories like Food, Utilities, or Shopping.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            <Plus className="size-3.5" /> Create first budget
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const pct = Math.min(100, Math.round((b.spent / b.monthlyLimit) * 100))
            const isOver = b.spent > b.monthlyLimit

            return (
              <div key={b.id} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{b.category}</span>
                    <button
                      onClick={() => handleDeleteBudget(b.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove budget"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between text-xs text-muted-foreground">
                    <span>
                      Spent: <strong className={isOver ? 'text-destructive font-bold' : 'text-foreground'}>{currency}{b.spent.toLocaleString()}</strong>
                    </span>
                    <span>Cap: {currency}{b.monthlyLimit.toLocaleString()}</span>
                  </div>

                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${
                        isOver ? 'bg-destructive' : pct > 80 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs">
                  {isOver ? (
                    <span className="flex items-center gap-1 font-medium text-destructive">
                      <AlertCircle className="size-3.5" /> Over budget by {currency}{(b.spent - b.monthlyLimit).toLocaleString()}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-600" /> {100 - pct}% remaining ({currency}{(b.monthlyLimit - b.spent).toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Set Category Budget</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-md p-2 text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            {error && <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}

            <form onSubmit={handleSaveBudget} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Housing">Housing & Rent</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Monthly Limit ({currency})
                <input
                  type="number"
                  step="0.01"
                  required
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="e.g. 15000"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Save Budget Cap'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
