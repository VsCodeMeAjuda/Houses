'use client'

import { FileText, Download, Upload, Search } from 'lucide-react'
import { useState } from 'react'
import { documents, properties } from '@/lib/data'
import { formatDate } from '@/lib/format'
import { Card, IconTile } from '@/components/ui/primitives'

export function DocumentsScreen() {
  const [query, setQuery] = useState('')

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-5 px-4 pb-4 pt-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar documentos"
          className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-accent/40 py-4 text-sm font-medium text-primary transition-colors active:bg-accent">
        <Upload className="size-4" />
        Enviar novo documento
      </button>

      <div className="space-y-2.5">
        {filtered.map((doc) => {
          const property = properties.find((p) => p.id === doc.propertyId)
          return (
            <Card key={doc.id} className="flex items-center gap-3 p-3.5">
              <IconTile className="bg-primary/10 text-primary">
                <FileText className="size-5" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {doc.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {doc.category} • {property?.name ?? 'Geral'} • {doc.size}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {formatDate(doc.date)}
                </p>
              </div>
              <button
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors active:bg-accent"
                aria-label={`Baixar ${doc.name}`}
              >
                <Download className="size-4" />
              </button>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhum documento encontrado.
          </Card>
        )}
      </div>
    </div>
  )
}
