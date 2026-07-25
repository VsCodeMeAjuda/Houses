'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const baseField =
  'h-11 w-full rounded-2xl border bg-background px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30'

function labelClasses() {
  return 'mb-1.5 block text-xs font-medium text-muted-foreground'
}

function fieldBorder(error?: string) {
  return error ? 'border-danger focus:border-danger' : 'border-border focus:border-ring'
}

export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className={labelClasses()}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

export function TextField({
  label,
  error,
  className,
  ...props
}: { label: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} error={error} className={className}>
      <input className={cn(baseField, fieldBorder(error))} aria-invalid={!!error} {...props} />
    </Field>
  )
}

export function TextareaField({
  label,
  error,
  className,
  ...props
}: { label: string; error?: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} error={error} className={className}>
      <textarea
        className={cn(baseField, fieldBorder(error), 'h-auto min-h-[84px] resize-y py-2.5')}
        aria-invalid={!!error}
        {...props}
      />
    </Field>
  )
}

export function SelectField({
  label,
  error,
  options,
  className,
  ...props
}: {
  label: string
  error?: string
  options: { value: string; label: string }[]
  className?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} error={error} className={className}>
      <select className={cn(baseField, fieldBorder(error))} aria-invalid={!!error} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function FormActions({
  onCancel,
  submitLabel = 'Salvar',
  loading = false,
}: {
  onCancel: () => void
  submitLabel?: string
  loading?: boolean
}) {
  return (
    <div className="mt-2 flex gap-2 pt-1">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="h-11 flex-1 rounded-2xl bg-muted text-sm font-semibold text-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading}
        className="h-11 flex-1 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? 'Salvando…' : submitLabel}
      </button>
    </div>
  )
}
