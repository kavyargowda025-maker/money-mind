'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

export function AddTransactionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess?: () => void
}) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) {
      setError('Please fill in title and amount.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount,
          type,
          category,
          date,
          description,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save transaction')
      }

      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add transaction</h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 rounded-lg bg-muted p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`rounded-md py-2 transition-colors ${
                type === 'EXPENSE' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`rounded-md py-2 transition-colors ${
                type === 'INCOME' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'
              }`}
            >
              Income
            </button>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Title / Merchant
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
              placeholder="e.g. Grocery store, Salary"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Amount
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
                placeholder="0.00"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
              >
                {type === 'EXPENSE' ? (
                  <>
                    <option value="Food">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities">Utilities & Bills</option>
                    <option value="Housing">Housing & Rent</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="Income">Salary / Wages</option>
                    <option value="Freelance">Freelance / Business</option>
                    <option value="Investment">Investment Returns</option>
                    <option value="Gift">Gift / Bonus</option>
                    <option value="Other">Other Income</option>
                  </>
                )}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Description (Optional)
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring focus:ring-2"
              placeholder="Additional notes"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save transaction'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
