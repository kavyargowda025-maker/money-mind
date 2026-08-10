'use client'

import { X } from 'lucide-react'

export function AddTransactionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add transaction</h2>
          <button onClick={onClose} className="rounded-md p-2 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Merchant
            <input className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none ring-ring focus:ring-2" placeholder="e.g. Local market" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Amount
              <input type="number" className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none ring-ring focus:ring-2" placeholder="₹0.00" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Category
              <select className="rounded-lg border border-input bg-background px-3 py-2 font-normal outline-none ring-ring focus:ring-2">
                <option>Groceries</option>
                <option>Dining</option>
                <option>Housing</option>
                <option>Software</option>
              </select>
            </label>
          </div>
          <button onClick={onClose} className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            Save transaction
          </button>
        </div>
      </div>
    </div>
  )
}
