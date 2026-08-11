'use client'

import { useEffect, useState } from 'react'
import { Loader2, Check, User, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('₹')
  const [monthlyBudget, setMonthlyBudget] = useState('50000')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || '')
          setEmail(data.user.email || '')
        }
        if (data.settings) {
          setCurrency(data.settings.currency || '₹')
          setMonthlyBudget(String(data.settings.monthlyBudget || 50000))
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    setError('')

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          currency,
          monthlyBudget,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setSavedSuccess(true)
      router.refresh()
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Operation timed out or database unavailable.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-muted-foreground">Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Manage your account & preferences</h1>
      </div>

      {savedSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 border border-emerald-500/20 animate-in fade-in duration-200">
          <Check className="size-4" />
          Settings saved successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 animate-in fade-in duration-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <User className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold">User Profile</h2>
              <p className="text-xs text-muted-foreground">Update your display name and personal details</p>
            </div>
          </div>

          <div className="mt-6 flex max-w-md flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Display Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring transition-all focus:ring-2"
                placeholder="Jordan Miller"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Email Address (Read-only)
              <input
                type="email"
                disabled
                value={email}
                className="rounded-lg border border-input bg-muted px-3 py-2 text-sm font-normal text-muted-foreground outline-none cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Globe className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold">Financial Preferences</h2>
              <p className="text-xs text-muted-foreground">Set your default currency symbol and target monthly budget</p>
            </div>
          </div>

          <div className="mt-6 flex max-w-md flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Preferred Currency
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring transition-all focus:ring-2"
              >
                <option value="₹">₹ (INR - Rupee)</option>
                <option value="$">$ (USD - Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - Pound)</option>
                <option value="¥">¥ (JPY / CNY)</option>
                <option value="A$">A$ (AUD - Australian Dollar)</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Monthly Budget Target ({currency})
              <input
                type="number"
                step="0.01"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none ring-ring transition-all focus:ring-2"
                placeholder="50000"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
