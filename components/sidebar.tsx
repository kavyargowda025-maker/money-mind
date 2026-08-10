'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowDownLeft,
  CreditCard,
  LayoutDashboard,
  Settings,
  Target,
  WalletCards,
  ChevronDown
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-sidebar px-5 py-6 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><WalletCards className="size-5" /></div>
        <span className="font-mono text-lg font-semibold tracking-tight">Money Mind</span>
      </div>
      <div className="mt-12 flex flex-1 flex-col gap-1">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
        {[
          { label: 'Overview', href: '/', icon: LayoutDashboard },
          { label: 'Transactions', href: '/transactions', icon: ArrowDownLeft },
          { label: 'Budgets', href: '/budgets', icon: CreditCard },
          { label: 'Goals', href: '/goals', icon: Target },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === href ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'}`}>
            <Icon className="size-4" />{label}
          </Link>
        ))}
        <Link href="/settings" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${pathname === '/settings' ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'}`}><Settings className="size-4" />Settings</Link>
      </div>
      <div className="border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2"><div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">JD</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Jordan Davis</p><p className="truncate text-xs text-muted-foreground">Personal workspace</p></div><ChevronDown className="size-4 text-muted-foreground" /></div>
      </div>
    </aside>
  )
}
