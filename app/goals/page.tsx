'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Loader2, Target, DollarSign, X } from 'lucide-react'

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  color?: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [currency, setCurrency] = useState('₹')
  const [loading, setLoading] = useState(true)

  // Add Goal Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Deposit Modal state
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/goals')
      const data = await res.json()

      if (data.goals) setGoals(data.goals)
      if (data.currency) setCurrency(data.currency)
    } catch (e) {
      console.error('Failed to load goals:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !targetAmount) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          targetAmount,
          currentAmount,
          deadline,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create goal')

      setShowAddModal(false)
      setTitle('')
      setTargetAmount('')
      setCurrentAmount('')
      setDeadline('')
      fetchGoals()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositGoal || !depositAmount) return

    setDepositing(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: depositGoal.id,
          depositAmount,
        }),
      })

      if (res.ok) {
        setDepositGoal(null)
        setDepositAmount('')
        fetchGoals()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDepositing(false)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    fetchGoals()
  }

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0)
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0)

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Financial Goals</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Keep your eye on the future</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" /> Create goal
          </button>
        </div>
      </div>

      {/* Summary Header */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Saved Across Goals</p>
          <p className="mt-2 text-2xl font-semibold">{currency}{totalSaved.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Target Goal Amount</p>
          <p className="mt-2 text-2xl font-semibold">{currency}{totalTarget.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Target className="mx-auto size-10 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">No savings goals created</p>
          <p className="mt-1 text-xs text-muted-foreground">Set up targets for vacation, emergency fund, or major purchases.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            <Plus className="size-3.5" /> Create first goal
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
            const isComplete = g.currentAmount >= g.targetAmount

            return (
              <div key={g.id} className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-xs">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold">{g.title}</h2>
                      {g.deadline && <p className="mt-1 text-xs text-muted-foreground">Target Date: {g.deadline}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Delete goal"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-6 flex items-baseline justify-between">
                    <span className="text-2xl font-semibold tracking-tight">
                      {currency}{g.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      of {currency}{g.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-2 text-right text-xs font-medium text-muted-foreground">
                    {pct}% achieved
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <button
                    onClick={() => setDepositGoal(g)}
                    disabled={isComplete}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <DollarSign className="size-3.5 text-emerald-600" />
                    {isComplete ? 'Goal Completed 🎉' : 'Deposit Funds'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create Financial Goal</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-md p-2 text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            {error && <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}

            <form onSubmit={handleCreateGoal} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Goal Title
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Emergency Fund, New Car"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Target Amount ({currency})
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="100000"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Initial Deposit ({currency})
                  <input
                    type="number"
                    step="0.01"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Target Date (Optional)
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Create Savings Goal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Funds Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Funds to {depositGoal.title}</h2>
              <button onClick={() => setDepositGoal(null)} className="rounded-md p-2 text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Deposit Amount ({currency})
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="5000"
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                />
              </label>

              <button
                type="submit"
                disabled={depositing}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {depositing ? <Loader2 className="size-4 animate-spin" /> : 'Confirm Deposit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
