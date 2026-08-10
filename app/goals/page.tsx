'use client'

import { Plus } from 'lucide-react'

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">Goals</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Keep your eye on the future.</h1>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            <Plus className="size-4" />Create goal
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 text-center">
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-5 py-8 text-center sm:px-6">
          <p className="text-sm font-medium">No goals yet</p>
          <p className="text-xs text-muted-foreground">Create a goal to start building toward it.</p>
        </div>
      </div>
    </div>
  )
}
