'use client'

import { Menu, Settings } from 'lucide-react'
import { useApp, viewTitles } from './app-context'
import { useData } from './data-context'

export function TopHeader() {
  const { setMenuOpen, view, setView, selectedPropertyId } = useApp()
  const { properties } = useData()

  const title = selectedPropertyId
    ? (properties.find((p) => p.id === selectedPropertyId)?.name ?? 'Imóvel')
    : view === 'dashboard'
      ? 'Property Manager'
      : viewTitles[view]

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95"
        >
          <Menu className="size-5" />
        </button>

        <h1 className="truncate px-2 text-base font-semibold tracking-tight text-foreground">
          {title}
        </h1>

        <button
          type="button"
          onClick={() => setView('settings')}
          aria-label="Configurações e perfil"
          className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95"
        >
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  )
}
