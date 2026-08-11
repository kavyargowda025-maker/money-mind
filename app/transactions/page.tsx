'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Trash2, ArrowUpRight, ArrowDownRight, Loader2, Filter } from 'lucide-react'
import { AddTransactionModal } from '@/components/add-transaction-modal'

interface Transaction {
  id: string
  title: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  description?: string
}

export default function TransactionsPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currency, setCurrency] = useState('₹')
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (typeFilter !== 'ALL') params.append('type', typeFilter)
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter)

      const res = await fetch(`/api/transactions?${params.toString()}`)
      const data = await res.json()

      if (data.transactions) setTransactions(data.transactions)
      if (data.currency) setCurrency(data.currency)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    } finally {
      setLoading(false)
    }
  }, [query, typeFilter, categoryFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
    fetchTransactions()
  }

  const categories = Array.from(new Set(transactions.map((t) => t.category)))

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Transactions</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">All your transactions</h1>
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

      <div className="rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, description, category..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expense Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-5 py-8 text-center sm:px-6">
            <Filter className="size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs text-muted-foreground">Try adjusting filters or click Add transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Transaction</th>
                  <th className="px-6 py-3.5 font-medium">Category</th>
                  <th className="px-6 py-3.5 font-medium">Date</th>
                  <th className="px-6 py-3.5 font-medium">Type</th>
                  <th className="px-6 py-3.5 text-right font-medium">Amount</th>
                  <th className="px-6 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">
                      <div>
                        <p className="text-sm text-foreground">{tx.title}</p>
                        {tx.description && <p className="text-xs text-muted-foreground">{tx.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {tx.type === 'INCOME' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      <span className={tx.type === 'INCOME' ? 'text-emerald-600' : 'text-foreground'}>
                        {tx.type === 'INCOME' ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Delete transaction"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onSuccess={fetchTransactions} />}
    </div>
  )
}
