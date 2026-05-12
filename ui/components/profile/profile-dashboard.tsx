"use client"

import { CreditCard, KeyRound, Shield, ShoppingBag } from "lucide-react"
import { useState, type ReactNode } from "react"
import type { PaymentMethodItem, PaymentSettings, PurchaseRow, Tab } from "@/model/profile"

export function ProfileHero({
  fullName,
  email,
  role,
  avatarUrl,
  activeTab,
  setActiveTab,
  tabs,
}: {
  fullName: string
  email: string
  role: string
  avatarUrl: string
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  tabs: { id: Tab; label: string }[]
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-52 bg-gradient-to-r from-[#1f3c2f] via-[#2f5f47] to-[#4a8768] md:h-64" />
      <div className="px-5 pb-4 md:px-8">
        <div className="-mt-14 flex flex-col gap-4 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <img src={avatarUrl} alt="Foto de perfil" className="h-28 w-28 rounded-full border-4 border-card object-cover md:h-36 md:w-36" />
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="pb-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-sm font-semibold text-forest">
              <Shield size={16} />
              {role}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-3 md:px-8">
        <div className="flex min-w-max gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-forest text-white" : "text-muted-foreground hover:bg-background"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SummaryTab({
  profileCompletion,
  phone,
  email,
  totalCompras,
  totalGastado,
  ticketPromedio,
  pendientes,
  purchases,
}: {
  profileCompletion: number
  phone: string
  email: string
  totalCompras: number
  totalGastado: number
  ticketPromedio: number
  pendientes: number
  purchases: PurchaseRow[]
}) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Tu progreso de perfil</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">{profileCompletion}%</p>
          <div className="mt-3 h-2 rounded-full bg-background">
            <div className="h-2 rounded-full bg-forest" style={{ width: `${profileCompletion}%` }} />
          </div>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Contacto</h3>
          <p className="mt-2 text-sm text-muted-foreground">{phone}</p>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </article>
      </aside>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Compras totales" value={String(totalCompras)} icon={<ShoppingBag size={18} />} />
          <MetricCard title="Total gastado" value={`$${totalGastado.toLocaleString("es-CO")} COP`} icon={<CreditCard size={18} />} />
          <MetricCard title="Ticket promedio" value={`$${ticketPromedio.toLocaleString("es-CO")} COP`} icon={<ShoppingBag size={18} />} />
          <MetricCard title="Pedidos pendientes" value={String(pendientes)} icon={<Shield size={18} />} />
        </div>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Actividad reciente</h3>
          <div className="mt-3 space-y-3">
            {purchases.slice(0, 3).map((purchase) => (
              <div key={purchase.id} className="rounded-xl bg-background p-3">
                <p className="text-sm font-semibold text-foreground">Compra #{purchase.id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(purchase.fecha).toLocaleDateString("es-CO")} - {purchase.estado}
                </p>
              </div>
            ))}
            {purchases.length === 0 ? <p className="text-sm text-muted-foreground">Sin actividad de compras por ahora.</p> : null}
          </div>
        </article>
      </div>
    </section>
  )
}

export function PurchasesTab({ purchases }: { purchases: PurchaseRow[] }) {
  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="space-y-3">
        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background p-6 text-muted-foreground">
            Aun no encontramos compras en Supabase para este usuario. Si ya tienes datos, valida tabla/campos (`compras`, `pedidos`, `orders`).
          </div>
        ) : (
          purchases.map((purchase) => (
            <article key={purchase.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">Compra #{purchase.id}</p>
                  <p className="text-sm text-muted-foreground">{new Date(purchase.fecha).toLocaleDateString("es-CO")}</p>
                </div>
                <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">{purchase.estado}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-foreground">
                <span>{purchase.items} items</span>
                <span className="font-semibold">${purchase.total.toLocaleString("es-CO")} COP</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

export function ProfileFormTab({
  form,
  setForm,
  onSubmit,
}: {
  form: {
    primer_nombre: string
    segundo_nombre: string
    primer_apellido: string
    segundo_apellido: string
    tipo_identificacion: string
    numero_identificacion: string
    telefono_celular: string
    foto_perfil_url: string
  }
  setForm: (next: (prev: {
    primer_nombre: string
    segundo_nombre: string
    primer_apellido: string
    segundo_apellido: string
    tipo_identificacion: string
    numero_identificacion: string
    telefono_celular: string
    foto_perfil_url: string
  }) => {
    primer_nombre: string
    segundo_nombre: string
    primer_apellido: string
    segundo_apellido: string
    tipo_identificacion: string
    numero_identificacion: string
    telefono_celular: string
    foto_perfil_url: string
  }) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Input label="Primer nombre" value={form.primer_nombre} onChange={(value) => setForm((s) => ({ ...s, primer_nombre: value }))} />
        <Input label="Segundo nombre" value={form.segundo_nombre} onChange={(value) => setForm((s) => ({ ...s, segundo_nombre: value }))} />
        <Input label="Primer apellido" value={form.primer_apellido} onChange={(value) => setForm((s) => ({ ...s, primer_apellido: value }))} />
        <Input label="Segundo apellido" value={form.segundo_apellido} onChange={(value) => setForm((s) => ({ ...s, segundo_apellido: value }))} />
        <Input label="Tipo de identificacion" value={form.tipo_identificacion} onChange={(value) => setForm((s) => ({ ...s, tipo_identificacion: value }))} />
        <Input label="Numero de identificacion" value={form.numero_identificacion} onChange={(value) => setForm((s) => ({ ...s, numero_identificacion: value }))} />
        <Input label="Telefono" value={form.telefono_celular} onChange={(value) => setForm((s) => ({ ...s, telefono_celular: value }))} />
        <Input label="Foto de perfil (URL)" value={form.foto_perfil_url} onChange={(value) => setForm((s) => ({ ...s, foto_perfil_url: value }))} />
        <div className="md:col-span-2">
          <button type="submit" className="rounded-xl bg-forest px-6 py-3 font-semibold text-white hover:bg-forest-dark">
            Guardar perfil
          </button>
        </div>
      </form>
    </section>
  )
}

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
            <option value="credito">Tarjeta credito</option>
            <option value="debito">Tarjeta debito</option>
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
                {method.alias}{" "}
                {(method.tipo === "credito" || method.tipo === "debito") && method.ultimos4 ? `**** ${method.ultimos4}` : ""}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{method.tipo}</p>
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
        <Input label="Metodo de pago preferido" value={form.metodo_preferido} onChange={(value) => setForm((s) => ({ ...s, metodo_preferido: value }))} placeholder="Tarjeta / Transferencia / Nequi" />
        <Input label="Titular de facturacion" value={form.titular_facturacion} onChange={(value) => setForm((s) => ({ ...s, titular_facturacion: value }))} />
        <Input label="Documento de facturacion" value={form.documento_facturacion} onChange={(value) => setForm((s) => ({ ...s, documento_facturacion: value }))} />
        <div className="md:col-span-2">
          <button type="submit" className="rounded-xl bg-forest px-6 py-3 font-semibold text-white hover:bg-forest-dark">
            Guardar pagos
          </button>
        </div>
      </form>
    </section>
  )
}

export function SecurityTab({
  form,
  setForm,
  onSubmit,
}: {
  form: { password: string; confirm: string }
  setForm: (next: (prev: { password: string; confirm: string }) => { password: string; confirm: string }) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <Input type="password" label="Nueva contrasena" value={form.password} onChange={(value) => setForm((s) => ({ ...s, password: value }))} />
        <Input type="password" label="Confirmar contrasena" value={form.confirm} onChange={(value) => setForm((s) => ({ ...s, confirm: value }))} />
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

function MetricCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <article className="rounded-2xl border border-border bg-background p-4">
      <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {title}
      </p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </article>
  )
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
      />
    </label>
  )
}
