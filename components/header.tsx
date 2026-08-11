'use client'

import { useEffect, useState } from 'react'
import { Bell, WalletCards, LogOut, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('Jordan Miller')
  const [userEmail, setUserEmail] = useState<string>('')
  const [currency, setCurrency] = useState<string>('₹')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name || data.user.email?.split('@')[0] || 'User')
          setUserEmail(data.user.email || '')
        }
        if (data.settings) {
          setCurrency(data.settings.currency || '₹')
        }
      })
      .catch(() => {})
  }, [])

  const handleSignOut = async () => {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 sm:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <WalletCards className="size-4" />
        </div>
        <span className="font-mono font-semibold">Money Mind</span>
      </div>

      <div className="hidden text-sm text-muted-foreground sm:block">{currentDate}</div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground sm:inline-block">
          Currency: {currency}
        </span>

        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 transition-colors hover:bg-muted"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials || 'U'}
            </div>
            <span className="max-w-28 truncate text-xs font-medium">{userName}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-border bg-popover p-2 shadow-lg">
              <div className="border-b border-border px-3 py-2">
                <p className="text-xs font-semibold text-popover-foreground">{userName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
              </div>

              <div className="mt-1 flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/settings')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-popover-foreground hover:bg-muted"
                >
                  <UserIcon className="size-3.5 text-muted-foreground" />
                  Account Settings
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
