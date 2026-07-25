'use client'

import { useState } from 'react'
import {
  User,
  Bell,
  Globe,
  Shield,
  CircleHelp,
  ChevronRight,
  Moon,
} from 'lucide-react'
import { Card, IconTile } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

export function SettingsScreen() {
  const [notify, setNotify] = useState(true)
  const [darkPref, setDarkPref] = useState(false)

  return (
    <div className="space-y-6 px-4 pb-4 pt-2">
      <Card className="flex items-center gap-4 p-5">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
          RP
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">
            Ricardo Pereira
          </p>
          <p className="text-sm text-muted-foreground">ricardo@email.com</p>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted-foreground">
          Preferências
        </h2>
        <Card className="divide-y divide-border">
          <ToggleRow
            icon={Bell}
            label="Notificações push"
            enabled={notify}
            onToggle={() => setNotify((v) => !v)}
          />
          <ToggleRow
            icon={Moon}
            label="Modo escuro"
            enabled={darkPref}
            onToggle={() => setDarkPref((v) => !v)}
          />
        </Card>
      </div>

      <div>
        <h2 className="mb-3 px-1 text-sm font-medium text-muted-foreground">
          Conta
        </h2>
        <Card className="divide-y divide-border">
          <LinkRow icon={User} label="Dados pessoais" />
          <LinkRow icon={Globe} label="Idioma e moeda" value="PT-BR • BRL" />
          <LinkRow icon={Shield} label="Segurança e privacidade" />
          <LinkRow icon={CircleHelp} label="Ajuda e suporte" />
        </Card>
      </div>

      <p className="pt-2 text-center text-xs text-muted-foreground">
        Property Manager • Versão 1.0.0
      </p>
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  enabled,
  onToggle,
}: {
  icon: typeof Bell
  label: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <IconTile>
        <Icon className="size-5" />
      </IconTile>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-1 size-5 rounded-full bg-card shadow transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}

function LinkRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value?: string
}) {
  return (
    <button className="flex w-full items-center gap-3 p-4 text-left transition-colors active:bg-accent/40">
      <IconTile>
        <Icon className="size-5" />
      </IconTile>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  )
}
