"use client"

import { CreditCard, FileText, Shield, ShoppingBag, UserRound } from "lucide-react"
import type { ReactNode } from "react"

import type { PurchaseRow } from "@/model/profile"

// Resume la actividad del usuario y el nivel de completitud de su perfil comercial.
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
          <p className="mt-3 text-xs text-muted-foreground">
            Completa identidad, contacto y fotografia para fortalecer la trazabilidad comercial.
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Contacto verificado</h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <UserRound size={15} />
              {phone}
            </p>
            <p className="flex items-center gap-2">
              <FileText size={15} />
              {email}
            </p>
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
