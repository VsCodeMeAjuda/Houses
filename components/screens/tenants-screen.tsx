'use client'

import { useState } from 'react'
import {
  Phone,
  Mail,
  Plus,
  ChevronDown,
  Calendar,
  Banknote,
  ShieldCheck,
  Percent,
  CreditCard,
  Handshake,
  IdCard,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Card, StatusBadge } from '../ui/primitives'
import { ConfirmDialog } from '../ui/modal'
import { TenantForm } from '../forms/tenant-form'
import { useData } from '../data-context'
import { useToast } from '../ui/toast'
import {
  relationshipLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  type Tenant,
} from '@/lib/data'
import { formatCurrency, formatDate, daysUntil } from '@/lib/format'

export function TenantsScreen() {
  const { tenants, properties, deleteTenant } = useData()
  const { toast } = useToast()
  const [expanded, setExpanded] = useState<string | null>(tenants[0]?.id ?? null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tenant | null>(null)
  const [confirming, setConfirming] = useState<Tenant | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(t: Tenant) {
    setEditing(t)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!confirming) return
    setDeleting(true)
    try {
      await deleteTenant(confirming.id)
      toast('Inquilino removido.')
      setConfirming(null)
    } catch (err: any) {
      console.log('[v0] tenant delete error:', err?.message)
      toast('Erro ao remover o inquilino.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Ativos" value={String(tenants.length)} />
        <MiniStat
          label="Em dia"
          value={String(tenants.filter((t) => t.paymentStatus === 'paid').length)}
        />
        <MiniStat
          label="Pendentes"
          value={String(tenants.filter((t) => t.paymentStatus !== 'paid').length)}
        />
      </div>

      {tenants.length === 0 && (
        <Card className="flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhum inquilino cadastrado ainda.</p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {tenants.map((t) => {
          const property = properties.find((p) => p.id === t.propertyId)
          const isOpen = expanded === t.id
          const daysLeft = daysUntil(t.contractEnd)
          return (
            <Card key={t.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : t.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-base font-semibold text-primary">
                  {t.fullName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{t.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {property?.name ?? 'Sem imóvel vinculado'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge
                    variant={
                      t.paymentStatus === 'paid'
                        ? 'success'
                        : t.paymentStatus === 'overdue'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {paymentStatusLabels[t.paymentStatus]}
                  </StatusBadge>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="animate-slide-up border-t border-border px-4 pb-4 pt-4">
                  <div className="flex gap-2">
                    <a
                      href={`tel:${t.phone}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-muted py-2.5 text-sm font-medium text-foreground"
                    >
                      <Phone className="size-4" /> Ligar
                    </a>
                    <a
                      href={`mailto:${t.email}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-muted py-2.5 text-sm font-medium text-foreground"
                    >
                      <Mail className="size-4" /> E-mail
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                    <Detail icon={IdCard} label="CPF" value={t.cpf || '—'} />
                    <Detail icon={Calendar} label="Dia de vencimento" value={`Dia ${t.paymentDueDay}`} />
                    <Detail icon={Banknote} label="Aluguel" value={formatCurrency(t.monthlyRent)} />
                    <Detail icon={ShieldCheck} label="Caução" value={formatCurrency(t.securityDeposit)} />
                    <Detail
                      icon={CreditCard}
                      label="Forma de pagamento"
                      value={paymentMethodLabels[t.paymentMethod]}
                    />
                    <Detail
                      icon={Handshake}
                      label="Relação"
                      value={relationshipLabels[t.relationship]}
                    />
                    {t.commissionPercent > 0 && (
                      <Detail icon={Percent} label="Comissão" value={`${t.commissionPercent}%`} />
                    )}
                  </div>

                  <div className="mt-4 rounded-2xl bg-muted/60 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Vigência do contrato</span>
                      <span
                        className={`font-medium ${daysLeft <= 30 ? 'text-danger' : 'text-foreground'}`}
                      >
                        {daysLeft <= 0 ? 'Vencido' : `${daysLeft} dias restantes`}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(t.contractStart)} — {formatDate(t.contractEnd)}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground transition-transform active:scale-[0.98]"
                    >
                      <Pencil className="size-4" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(t)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-danger/10 py-2.5 text-sm font-semibold text-danger transition-transform active:scale-[0.98]"
                    >
                      <Trash2 className="size-4" /> Excluir
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-24 right-4 z-20 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="size-5" />
        Novo inquilino
      </button>

      <TenantForm open={formOpen} onClose={() => setFormOpen(false)} tenant={editing} />
      <ConfirmDialog
        open={!!confirming}
        title="Excluir inquilino"
        message={`Tem certeza que deseja excluir ${confirming?.fullName}? Esta ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(null)}
      />
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
