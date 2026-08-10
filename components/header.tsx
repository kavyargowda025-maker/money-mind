import { Bell, WalletCards } from 'lucide-react'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-5 sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><WalletCards className="size-4" /></div>
        <span className="font-mono font-semibold">Money Mind</span>
      </div>
      <div className="hidden text-sm text-muted-foreground sm:block">Wednesday, May 14, 2025</div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Notifications">
          <Bell className="size-4" />
        </button>
        <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">JD</div>
      </div>
    </header>
  )
}
