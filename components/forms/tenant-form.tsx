'use client'

import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/modal'
import { TextField, SelectField, FormActions } from '../ui/form'
import { useData } from '../data-context'
import { useToast } from '../ui/toast'
import {
  relationshipLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  type Tenant,
  type RelationshipType,
  type TenantPaymentMethod,
  type PaymentStatus,
} from '@/lib/data'
import { toDateInputValue, fromDateInputValue } from '@/lib/format'

interface Props {
  open: boolean
  onClose: () => void
  tenant?: Tenant | null
}

const relationshipOptions = (Object.keys(relationshipLabels) as RelationshipType[]).map((k) => ({
  value: k,
  label: relationshipLabels[k],
}))
const methodOptions = (Object.keys(paymentMethodLabels) as TenantPaymentMethod[]).map((k) => ({
  value: k,
  label: paymentMethodLabels[k],
}))
const statusOptions = (Object.keys(paymentStatusLabels) as PaymentStatus[]).map((k) => ({
  value: k,
  label: paymentStatusLabels[k],
}))

export function TenantForm({ open, onClose, tenant }: Props) {
  const { properties, createTenant, updateTenant } = useData()
  const { toast } = useToast()
  const isEdit = !!tenant

  const propertyOptions = [
    { value: '', label: 'Sem imóvel vinculado' },
    ...properties.map((p) => ({ value: p.id, label: p.name })),
  ]

  const [form, setForm] = useState({
    fullName: tenant?.fullName ?? '',
    cpf: tenant?.cpf ?? '',
    phone: tenant?.phone ?? '',
    email: tenant?.email ?? '',
    propertyId: tenant?.propertyId ?? '',
    contractStart: toDateInputValue(tenant?.contractStart ?? new Date().toISOString()),
    contractEnd: toDateInputValue(tenant?.contractEnd ?? new Date().toISOString()),
    monthlyRent: tenant?.monthlyRent?.toString() ?? '',
    securityDeposit: tenant?.securityDeposit?.toString() ?? '',
    paymentDueDay: tenant?.paymentDueDay?.toString() ?? '5',
    paymentStatus: (tenant?.paymentStatus ?? 'pending') as PaymentStatus,
    relationship: (tenant?.relationship ?? 'direct') as RelationshipType,
    commissionPercent: tenant?.commissionPercent?.toString() ?? '0',
    paymentMethod: (tenant?.paymentMethod ?? 'pix') as TenantPaymentMethod,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = 'Informe o nome do inquilino.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.'
    const day = Number(form.paymentDueDay)
    if (Number.isNaN(day) || day < 1 || day > 31) e.paymentDueDay = 'Dia entre 1 e 31.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    const payload = {
      fullName: form.fullName.trim(),
      cpf: form.cpf.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      propertyId: form.propertyId,
      contractStart: fromDateInputValue(form.contractStart),
      contractEnd: fromDateInputValue(form.contractEnd),
      monthlyRent: Number(form.monthlyRent) || 0,
      securityDeposit: Number(form.securityDeposit) || 0,
      paymentDueDay: Number(form.paymentDueDay) || 5,
      paymentStatus: form.paymentStatus,
      relationship: form.relationship,
      commissionPercent: Number(form.commissionPercent) || 0,
      paymentMethod: form.paymentMethod,
    }
    try {
      if (isEdit && tenant) {
        await updateTenant(tenant.id, payload)
        toast('Inquilino atualizado com sucesso.')
      } else {
        await createTenant(payload)
        toast('Inquilino cadastrado com sucesso.')
      }
      onClose()
    } catch (err: any) {
      console.log('[v0] tenant save error:', err?.message)
      toast('Erro ao salvar o inquilino.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar inquilino' : 'Novo inquilino'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <TextField label="Nome completo" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} placeholder="Ex.: Mariana Costa" />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" />
          <TextField label="Telefone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(11) 90000-0000" />
        </div>
        <TextField label="E-mail" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} placeholder="nome@email.com" />
        <SelectField label="Imóvel" value={form.propertyId} onChange={(e) => set('propertyId', e.target.value)} options={propertyOptions} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Início do contrato" type="date" value={form.contractStart} onChange={(e) => set('contractStart', e.target.value)} />
          <TextField label="Fim do contrato" type="date" value={form.contractEnd} onChange={(e) => set('contractEnd', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Aluguel mensal (R$)" type="number" inputMode="decimal" value={form.monthlyRent} onChange={(e) => set('monthlyRent', e.target.value)} />
          <TextField label="Caução (R$)" type="number" inputMode="decimal" value={form.securityDeposit} onChange={(e) => set('securityDeposit', e.target.value)} />
          <TextField label="Dia de vencimento" type="number" inputMode="numeric" value={form.paymentDueDay} onChange={(e) => set('paymentDueDay', e.target.value)} error={errors.paymentDueDay} />
          <SelectField label="Status de pagamento" value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value as PaymentStatus)} options={statusOptions} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Relação" value={form.relationship} onChange={(e) => set('relationship', e.target.value as RelationshipType)} options={relationshipOptions} />
          <SelectField label="Forma de pagamento" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value as TenantPaymentMethod)} options={methodOptions} />
        </div>
        <TextField label="Comissão (%)" type="number" inputMode="decimal" value={form.commissionPercent} onChange={(e) => set('commissionPercent', e.target.value)} />
        <FormActions onCancel={onClose} loading={loading} submitLabel={isEdit ? 'Salvar alterações' : 'Cadastrar'} />
      </form>
    </Modal>
  )
}
