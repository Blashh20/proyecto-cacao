"use client"

import { KeyRound } from "lucide-react"

import { ProfileInput } from "@/ui/components/dashboard/profile-input"

type SecurityForm = {
  password: string
  confirm: string
}

// Presenta el formulario de cambio de contrasena del usuario autenticado.
export function SecurityTab({
  form,
  setForm,
  onSubmit,
}: {
  form: SecurityForm
  setForm: (next: (prev: SecurityForm) => SecurityForm) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <ProfileInput type="password" label="Nueva contrasena" value={form.password} onChange={(value) => setForm((s) => ({ ...s, password: value }))} />
        <ProfileInput type="password" label="Confirmar contrasena" value={form.confirm} onChange={(value) => setForm((s) => ({ ...s, confirm: value }))} />
        <div className="md:col-span-2">
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white hover:bg-forest-dark">
            <KeyRound size={16} />
            Cambiar contrasena
          </button>
        </div>
      </form>
    </section>
  )
}
