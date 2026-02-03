'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VisusLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ImagePlus,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import React from 'react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Converter', href: '/converter', icon: ImagePlus }
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between gap-2 border-b border-border px-4 lg:justify-start">
            <Link href="/dashboard" className="flex items-center gap-2">
              <VisusLogo className="h-5" />
              <span className="font-visus text-lg tracking-tight">Visus</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="size-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-border p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => signOut({ fetchOptions: { onSuccess: () => window.location.href = '/' } })}
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col lg:min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </Button>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
