"use client"

import { BadgeCheck, CreditCard, FileText, KeyRound, MapPin, Send, Shield, ShoppingBag, Upload, UserRound } from "lucide-react"
import Image from "next/image"
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import type { PaymentMethodItem, PaymentSettings, PurchaseRow, Tab } from "@/model/profile"
import type { Project } from "@/model/projects"
import {
  CACAO_VARIETIES,
  IDENTIFICATION_TYPES,
  LOCATION_CATALOG,
  PRODUCTION_RANGES,
  PROJECT_TYPES,
  getMunicipalitiesByDepartment,
} from "@/ui/components/profile/profile-catalogs"

export { ProfileLogoLoader } from "@/ui/components/profile/profile-loader"

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
      <div className="relative h-52 bg-[linear-gradient(135deg,#14231d_0%,#315f4a_52%,#d7a84d_100%)] md:h-64">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/70 to-transparent" />
      </div>
      <div className="px-5 pb-4 md:px-8">
        <div className="-mt-14 flex flex-col gap-4 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-4">
            <Image
              src={avatarUrl}
              alt="Foto de perfil"
              width={144}
              height={144}
              className="h-28 w-28 rounded-full border-4 border-card object-cover md:h-36 md:w-36"
            />
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{email}</p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                <BadgeCheck size={14} />
                Perfil comercial cacaotero
              </p>
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
          <h3 className="text-sm font-bold text-foreground">Madurez del perfil</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">{profileCompletion}%</p>
          <div className="mt-3 h-2 rounded-full bg-background">
            <div className="h-2 rounded-full bg-forest" style={{ width: `${profileCompletion}%` }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Completa identidad, contacto y fotografia para fortalecer la trazabilidad comercial.</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Contacto verificado</h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><UserRound size={15} />{phone}</p>
            <p className="flex items-center gap-2"><FileText size={15} />{email}</p>
          </div>
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
          <h3 className="text-sm font-bold text-foreground">Actividad comercial reciente</h3>
          <div className="mt-3 space-y-3">
            {purchases.slice(0, 3).map((purchase) => (
              <div key={purchase.id} className="rounded-xl bg-background p-3">
                <p className="text-sm font-semibold text-foreground">Compra #{purchase.id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(purchase.fecha).toLocaleDateString("es-CO")} - {purchase.estado}
                </p>
              </div>
            ))}
            {purchases.length === 0 ? <p className="text-sm text-muted-foreground">Sin ventas registradas por ahora.</p> : null}
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
            Aún no encontramos registros en `ventas` con los campos del diccionario.
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

export function ProjectSubmissionTab({
  form,
  setForm,
  projects,
  onSubmit,
}: {
  form: {
    name: string
    department: string
    municipality: string
    lat: string
    lng: string
    localType: string
    description: string
    hectares: string
    families: string
    yearStarted: string
    production: string
    variety: string
    image: string
  }
  setForm: (next: (prev: {
    name: string
    department: string
    municipality: string
    lat: string
    lng: string
    localType: string
    description: string
    hectares: string
    families: string
    yearStarted: string
    production: string
    variety: string
    image: string
  }) => {
    name: string
    department: string
    municipality: string
    lat: string
    lng: string
    localType: string
    description: string
    hectares: string
    families: string
    yearStarted: string
    production: string
    variety: string
    image: string
  }) => void
  projects: Project[]
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const municipalities = useMemo(() => getMunicipalitiesByDepartment(form.department), [form.department])

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result || "/images/cacao-pods.jpg") }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest/10 text-forest">
            <Upload size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Registro tecnico del proyecto</h3>
            <p className="text-sm text-muted-foreground">Envia informacion normalizada para revision del administrador.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nombre del proyecto" value={form.name} onChange={(value) => setForm((s) => ({ ...s, name: value }))} />
          <Select
            label="Tipo de operacion"
            value={form.localType}
            onChange={(value) => setForm((s) => ({ ...s, localType: value }))}
            options={PROJECT_TYPES.map((item) => ({ value: item, label: item }))}
          />
          <Select
            label="Departamento"
            value={form.department}
            onChange={(value) => setForm((s) => ({ ...s, department: value, municipality: "" }))}
            options={LOCATION_CATALOG.map((item) => ({ value: item.department, label: item.department }))}
            placeholder="Selecciona departamento"
          />
          <Select
            label="Municipio"
            value={form.municipality}
            onChange={(value) => setForm((s) => ({ ...s, municipality: value }))}
            options={municipalities.map((item) => ({ value: item, label: item }))}
            placeholder={form.department ? "Selecciona municipio" : "Primero elige departamento"}
            disabled={!form.department}
          />
          <Input label="Latitud" type="number" value={form.lat} onChange={(value) => setForm((s) => ({ ...s, lat: value }))} />
          <Input label="Longitud" type="number" value={form.lng} onChange={(value) => setForm((s) => ({ ...s, lng: value }))} />
          <Input label="Hectareas" type="number" value={form.hectares} onChange={(value) => setForm((s) => ({ ...s, hectares: value }))} />
          <Input label="Familias beneficiadas" type="number" value={form.families} onChange={(value) => setForm((s) => ({ ...s, families: value }))} />
          <Input label="Ano de inicio" type="number" value={form.yearStarted} onChange={(value) => setForm((s) => ({ ...s, yearStarted: value }))} />
          <Select
            label="Produccion estimada"
            value={form.production}
            onChange={(value) => setForm((s) => ({ ...s, production: value }))}
            options={PRODUCTION_RANGES.map((item) => ({ value: item, label: item }))}
            placeholder="Selecciona rango"
          />
          <Select
            label="Variedad principal"
            value={form.variety}
            onChange={(value) => setForm((s) => ({ ...s, variety: value }))}
            options={CACAO_VARIETIES.map((item) => ({ value: item, label: item }))}
            placeholder="Selecciona variedad"
          />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">Imagen del proyecto</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-forest/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest hover:file:bg-forest/20"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Descripcion</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((s) => ({ ...s, description: event.target.value }))}
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </label>

        <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white hover:bg-forest-dark">
          <Send size={16} />
          Enviar a revision
        </button>
      </form>

      <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin size={17} className="text-forest" />
          <h3 className="text-sm font-bold text-foreground">Mis solicitudes</h3>
        </div>
        <div className="mt-3 space-y-3">
          {projects.length === 0 ? <p className="text-sm text-muted-foreground">Todavia no has enviado proyectos.</p> : null}
          {projects.slice().reverse().map((project) => (
            <article key={project.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.location}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{project.description}</p>
            </article>
          ))}
        </div>
      </aside>
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
    <section className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-forest">
          <UserRound size={22} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Datos maestros</h3>
        <p className="mt-2 text-sm text-muted-foreground">Estos campos identifican al usuario dentro del flujo comercial. Los valores sensibles se capturan con listas controladas cuando aplica.</p>
      </aside>

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-forest">
            <FileText size={19} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Identidad y contacto</h3>
            <p className="text-sm text-muted-foreground">Mantiene trazabilidad para compras, pagos y solicitudes de proyecto.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Primer nombre" value={form.primer_nombre} onChange={(value) => setForm((s) => ({ ...s, primer_nombre: value }))} />
          <Input label="Segundo nombre" value={form.segundo_nombre} onChange={(value) => setForm((s) => ({ ...s, segundo_nombre: value }))} />
          <Input label="Primer apellido" value={form.primer_apellido} onChange={(value) => setForm((s) => ({ ...s, primer_apellido: value }))} />
          <Input label="Segundo apellido" value={form.segundo_apellido} onChange={(value) => setForm((s) => ({ ...s, segundo_apellido: value }))} />
          <Select
            label="Tipo de identificacion"
            value={form.tipo_identificacion}
            onChange={(value) => setForm((s) => ({ ...s, tipo_identificacion: value }))}
            options={IDENTIFICATION_TYPES.map((item) => ({ value: item.value, label: item.label }))}
            placeholder="Selecciona tipo"
          />
          <Input label="Numero de documento" value={form.numero_identificacion} onChange={(value) => setForm((s) => ({ ...s, numero_identificacion: value }))} />
          <Input label="Telefono celular" value={form.telefono_celular} onChange={(value) => setForm((s) => ({ ...s, telefono_celular: value.replace(/[^\d+\s-]/g, "") }))} />
          <Input label="Foto de perfil (URL)" value={form.foto_perfil_url} onChange={(value) => setForm((s) => ({ ...s, foto_perfil_url: value }))} />
          <div className="md:col-span-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white hover:bg-forest-dark">
              <Shield size={16} />
              Guardar perfil
            </button>
          </div>
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
        <Select
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

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  const className =
    normalized.includes("rechaz")
      ? "bg-red-500/10 text-red-300"
      : normalized.includes("aprob") || normalized.includes("activo")
        ? "bg-forest/10 text-forest-light"
        : "bg-amber-500/10 text-amber-300"

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{status}</span>
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona una opcion",
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
