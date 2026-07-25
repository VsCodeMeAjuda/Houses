'use client'

import { useState } from 'react'
import { Bell, CircleDollarSign, FileText, Wrench, Settings2, BellOff } from 'lucide-react'
import { notifications as initialNotifications, type AppNotification } from '@/lib/data'
import { relativeTime } from '@/lib/format'
import { Card, IconTile } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

const kindConfig = {
  payment: { icon: CircleDollarSign, cls: 'bg-primary/10 text-primary' },
  contract: { icon: FileText, cls: 'bg-warning/20 text-warning-foreground' },
  maintenance: { icon: Wrench, cls: 'bg-danger/10 text-danger' },
  system: { icon: Settings2, cls: 'bg-muted text-muted-foreground' },
}

export function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>(initialNotifications)
  const unread = items.filter((n) => !n.read).length

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="space-y-5 px-4 pb-4 pt-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {unread > 0 ? `${unread} não lidas` : 'Tudo em dia'}
        </p>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-primary"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <BellOff className="size-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhuma notificação.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const { icon: Icon, cls } = kindConfig[n.kind]
            return (
              <Card
                key={n.id}
                onClick={() =>
                  setItems((prev) =>
                    prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                  )
                }
                className={cn(
                  'flex cursor-pointer items-start gap-3 p-4 transition-colors',
                  !n.read && 'border-primary/30 bg-accent/40',
                )}
              >
                <IconTile className={cls}>
                  <Icon className="size-5" />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {n.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {relativeTime(n.date)}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
