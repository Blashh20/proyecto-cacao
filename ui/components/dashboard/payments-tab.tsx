"use client"

import { useState } from "react"

import type { PaymentMethodItem, PaymentSettings } from "@/model/profile"
import { ProfileInput } from "@/ui/components/dashboard/profile-input"
import { ProfileSelect } from "@/ui/components/dashboard/profile-select"

// Administra metodos de pago locales y la preferencia de facturacion del usuario.
export function PaymentsTab({
  form,
  setForm,
  methods,
  setMethods,
  onSubmit,
}: {
  form: PaymentSettings
  setForm: (next: (prev: PaymentSettings) => PaymentSettings) => void
  methods: PaymentMethodItem[]
  setMethods: (next: (prev: PaymentMethodItem[]) => PaymentMethodItem[]) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [draft, setDraft] = useState<{ tipo: PaymentMethodItem["tipo"]; alias: string; ultimos4: string }>({
    tipo: "credito",
    alias: "",
    ultimos4: "",
  })

  const addMethod = () => {
    if (!draft.alias.trim()) return
    if (draft.tipo === "credito" || draft.tipo === "debito") {
      if (!/^\d{4}$/.test(draft.ultimos4)) return
    }

    setMethods((prev) => {
      const newItem: PaymentMethodItem = {
        id: `${Date.now()}`,
        tipo: draft.tipo,
        alias: draft.alias.trim(),
        ultimos4: draft.ultimos4.trim(),
        principal: prev.length === 0,
      }
      return [...prev, newItem]
    })

    setDraft({ tipo: "credito", alias: "", ultimos4: "" })
    setShowAdd(false)
  }

  const removeMethod = (id: string) => {
    setMethods((prev) => prev.filter((method) => method.id !== id))
  }

  const setPrimary = (id: string) => {
    setMethods((prev) => prev.map((method) => ({ ...method, principal: method.id === id })))
    const selected = methods.find((method) => method.id === id)
    if (selected) {
      setForm((prev) => ({ ...prev, metodo_preferido: selected.alias }))
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Metodos de pago</h3>
        <button
          type="button"
          onClick={() => setShowAdd((prev) => !prev)}
          className="rounded-lg bg-forest px-3 py-2 text-xs font-semibold text-white hover:bg-forest-dark"
        >
          Agregar metodo
        </button>
      </div>

      {showAdd ? (
        <div className="mb-4 grid gap-3 rounded-xl border border-border bg-background p-3 md:grid-cols-4">
          <select
            value={draft.tipo}
            onChange={(event) => setDraft((prev) => ({ ...prev, tipo: event.target.value as PaymentMethodItem["tipo"] }))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="credito">Tarjeta de credito</option>
            <option value="debito">Tarjeta de debito</option>
            <option value="nequi">Nequi</option>
            <option value="daviplata">Daviplata</option>
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
          </select>
          <input
            placeholder="Alias (Ej: Visa personal)"
            value={draft.alias}
            onChange={(event) => setDraft((prev) => ({ ...prev, alias: event.target.value }))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm md:col-span-2"
          />
          <input
            placeholder="Ultimos 4"
            value={draft.ultimos4}
            onChange={(event) => setDraft((prev) => ({ ...prev, ultimos4: event.target.value.replace(/\D/g, "").slice(0, 4) }))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
          <div className="md:col-span-4">
            <button type="button" onClick={addMethod} className="rounded-lg border border-forest px-3 py-2 text-xs font-semibold text-forest">
              Guardar metodo
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-4 space-y-2">
        {methods.length === 0 ? <p className="text-sm text-muted-foreground">No has agregado metodos de pago todavia.</p> : null}
        {methods.map((method) => (
          <article key={method.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {method.alias} {(method.tipo === "credito" || method.tipo === "debito") && method.ultimos4 ? `**** ${method.ultimos4}` : ""}
              </p>
              <p className="text-xs capitalize text-muted-foreground">{method.tipo}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPrimary(method.id)}
                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                  method.principal ? "bg-forest/20 text-forest-light" : "border border-border text-muted-foreground"
                }`}
              >
                {method.principal ? "Principal" : "Hacer principal"}
              </button>
              <button type="button" onClick={() => removeMethod(method.id)} className="rounded-md px-2 py-1 text-xs text-red-300">
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <ProfileSelect
          label="Metodo de pago preferido"
          value={form.metodo_preferido}
          onChange={(value) => setForm((s) => ({ ...s, metodo_preferido: value }))}
          options={[
            { value: "Tarjeta de credito", label: "Tarjeta de credito" },
            { value: "Tarjeta de debito", label: "Tarjeta de debito" },
            { value: "Transferencia bancaria", label: "Transferencia bancaria" },
            { value: "Nequi", label: "Nequi" },
            { value: "Daviplata", label: "Daviplata" },
            { value: "Efectivo contra entrega", label: "Efectivo contra entrega" },
          ]}
          placeholder="Selecciona metodo"
        />
        <ProfileInput label="Titular de facturacion" value={form.titular_facturacion} onChange={(value) => setForm((s) => ({ ...s, titular_facturacion: value }))} />
        <ProfileInput label="Documento de facturacion" value={form.documento_facturacion} onChange={(value) => setForm((s) => ({ ...s, documento_facturacion: value }))} />
        <div className="md:col-span-2">
          <button type="submit" className="rounded-xl bg-forest px-6 py-3 font-semibold text-white hover:bg-forest-dark">
            Guardar pagos
          </button>
        </div>
      </form>
    </section>
  )
}
