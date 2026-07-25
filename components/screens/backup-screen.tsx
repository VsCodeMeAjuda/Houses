'use client'

import { useState } from 'react'
import {
  DatabaseBackup,
  FileSpreadsheet,
  FileText,
  CloudDownload,
  CircleCheck,
  RotateCcw,
} from 'lucide-react'
import { properties, tenants, payments, expenses } from '@/lib/data'
import { relativeTime } from '@/lib/format'
import { Card, SectionHeader, IconTile } from '@/components/ui/primitives'

export function BackupScreen() {
  const [lastBackup, setLastBackup] = useState<string>(
    new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  )
  const [busy, setBusy] = useState<string | null>(null)

  function run(key: string) {
    setBusy(key)
    setTimeout(() => {
      setBusy(null)
      if (key === 'backup') setLastBackup(new Date().toISOString())
    }, 1200)
  }

  const counts = [
    { label: 'Imóveis', value: properties.length },
    { label: 'Inquilinos', value: tenants.length },
    { label: 'Pagamentos', value: payments.length },
    { label: 'Despesas', value: expenses.length },
  ]

  return (
    <div className="space-y-6 px-4 pb-4 pt-2">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <IconTile className="bg-success/12 text-success">
            <CircleCheck className="size-5" />
          </IconTile>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Backup em dia
            </p>
            <p className="text-xs text-muted-foreground">
              Último backup {relativeTime(lastBackup).toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={() => run('backup')}
          disabled={busy === 'backup'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {busy === 'backup' ? (
            <RotateCcw className="size-4 animate-spin" />
          ) : (
            <DatabaseBackup className="size-4" />
          )}
          {busy === 'backup' ? 'Fazendo backup...' : 'Fazer backup agora'}
        </button>
      </Card>

      <Card className="grid grid-cols-4 divide-x divide-border">
        {counts.map((c) => (
          <div key={c.label} className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{c.value}</p>
            <p className="text-[11px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </Card>

      <div>
        <SectionHeader title="Exportar dados" className="mb-3" />
        <div className="space-y-2.5">
          <ExportRow
            icon={FileSpreadsheet}
            title="Exportar para Excel"
            subtitle="Planilha completa (.xlsx)"
            loading={busy === 'excel'}
            onClick={() => run('excel')}
          />
          <ExportRow
            icon={FileText}
            title="Exportar relatório PDF"
            subtitle="Resumo financeiro (.pdf)"
            loading={busy === 'pdf'}
            onClick={() => run('pdf')}
          />
          <ExportRow
            icon={CloudDownload}
            title="Exportar tudo (JSON)"
            subtitle="Dados brutos para migração"
            loading={busy === 'json'}
            onClick={() => run('json')}
          />
        </div>
      </div>
    </div>
  )
}

function ExportRow({
  icon: Icon,
  title,
  subtitle,
  loading,
  onClick,
}: {
  icon: typeof FileText
  title: string
  subtitle: string
  loading: boolean
  onClick: () => void
}) {
  return (
    <Card
      onClick={loading ? undefined : onClick}
      className="flex cursor-pointer items-center gap-3 p-3.5 transition-colors active:bg-accent/40"
    >
      <IconTile className="bg-primary/10 text-primary">
        {loading ? (
          <RotateCcw className="size-5 animate-spin" />
        ) : (
          <Icon className="size-5" />
        )}
      </IconTile>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          {loading ? 'Gerando arquivo...' : subtitle}
        </p>
      </div>
      <CloudDownload className="size-4 text-muted-foreground" />
    </Card>
  )
}
