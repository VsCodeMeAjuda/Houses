'use client'

import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/modal'
import { TextField, SelectField, FormActions } from '../ui/form'
import { useData } from '../data-context'
import { useToast } from '../ui/toast'
import { purchaseMethodLabels, type Property, type PurchaseMethod, type PropertyStatus } from '@/lib/data'
import { toDateInputValue, fromDateInputValue } from '@/lib/format'

interface Props {
  open: boolean
  onClose: () => void
  property?: Property | null
}

const statusOptions: { value: PropertyStatus; label: string }[] = [
  { value: 'vacant', label: 'Vago' },
  { value: 'occupied', label: 'Alugado' },
]

const methodOptions = (Object.keys(purchaseMethodLabels) as PurchaseMethod[]).map((k) => ({
  value: k,
  label: purchaseMethodLabels[k],
}))

export function PropertyForm({ open, onClose, property }: Props) {
  const { createProperty, updateProperty } = useData()
  const { toast } = useToast()
  const isEdit = !!property

  const [form, setForm] = useState({
    name: property?.name ?? '',
    address: property?.address ?? '',
    photo: property?.photo ?? '',
    status: (property?.status ?? 'vacant') as PropertyStatus,
    monthlyRent: property?.monthlyRent?.toString() ?? '',
    purchasePrice: property?.purchasePrice?.toString() ?? '',
    totalInvestment: property?.totalInvestment?.toString() ?? '',
    marketValue: property?.marketValue?.toString() ?? '',
    purchaseDate: toDateInputValue(property?.purchaseDate ?? new Date().toISOString()),
    purchaseMethod: (property?.purchaseMethod ?? 'cash') as PurchaseMethod,
    bedrooms: property?.bedrooms?.toString() ?? '',
    bathrooms: property?.bathrooms?.toString() ?? '',
    area: property?.area?.toString() ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Informe o nome do imóvel.'
    if (!form.address.trim()) e.address = 'Informe o endereço.'
    const nums: [string, string][] = [
      ['monthlyRent', form.monthlyRent],
      ['purchasePrice', form.purchasePrice],
      ['marketValue', form.marketValue],
    ]
    nums.forEach(([k, v]) => {
      if (v !== '' && (Number.isNaN(Number(v)) || Number(v) < 0)) e[k] = 'Valor inválido.'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      photo: form.photo.trim() || '/placeholder.svg',
      status: form.status,
      monthlyRent: Number(form.monthlyRent) || 0,
      purchasePrice: Number(form.purchasePrice) || 0,
      totalInvestment: Number(form.totalInvestment) || Number(form.purchasePrice) || 0,
      marketValue: Number(form.marketValue) || 0,
      purchaseDate: fromDateInputValue(form.purchaseDate),
      purchaseMethod: form.purchaseMethod,
      currentTenantId: property?.currentTenantId ?? null,
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      area: Number(form.area) || 0,
    }
    try {
      if (isEdit && property) {
        await updateProperty(property.id, payload)
        toast('Imóvel atualizado com sucesso.')
      } else {
        await createProperty(payload)
        toast('Imóvel cadastrado com sucesso.')
      }
      onClose()
    } catch (err: any) {
      console.log('[v0] property save error:', err?.message)
      toast('Erro ao salvar o imóvel.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar imóvel' : 'Novo imóvel'}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        <TextField label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="Ex.: Edifício Aurora 402" />
        <TextField label="Endereço" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} placeholder="Rua, número — bairro, cidade" />
        <TextField label="URL da foto (opcional)" value={form.photo} onChange={(e) => set('photo', e.target.value)} placeholder="/images/..." />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Situação" value={form.status} onChange={(e) => set('status', e.target.value as PropertyStatus)} options={statusOptions} />
          <SelectField label="Forma de aquisição" value={form.purchaseMethod} onChange={(e) => set('purchaseMethod', e.target.value as PurchaseMethod)} options={methodOptions} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Aluguel mensal (R$)" type="number" inputMode="decimal" value={form.monthlyRent} onChange={(e) => set('monthlyRent', e.target.value)} error={errors.monthlyRent} />
          <TextField label="Preço de compra (R$)" type="number" inputMode="decimal" value={form.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)} error={errors.purchasePrice} />
          <TextField label="Total investido (R$)" type="number" inputMode="decimal" value={form.totalInvestment} onChange={(e) => set('totalInvestment', e.target.value)} />
          <TextField label="Valor de mercado (R$)" type="number" inputMode="decimal" value={form.marketValue} onChange={(e) => set('marketValue', e.target.value)} error={errors.marketValue} />
        </div>
        <TextField label="Data de aquisição" type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
        <div className="grid grid-cols-3 gap-3">
          <TextField label="Quartos" type="number" inputMode="numeric" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
          <TextField label="Banheiros" type="number" inputMode="numeric" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
          <TextField label="Área (m²)" type="number" inputMode="decimal" value={form.area} onChange={(e) => set('area', e.target.value)} />
        </div>
        <FormActions onCancel={onClose} loading={loading} submitLabel={isEdit ? 'Salvar alterações' : 'Cadastrar'} />
      </form>
    </Modal>
  )
}
