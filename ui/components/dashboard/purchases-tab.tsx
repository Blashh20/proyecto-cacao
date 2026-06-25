"use client"

import type { PurchaseRow } from "@/model/profile"

// Lista las compras o ventas asociadas al usuario dentro de su perfil.
export function PurchasesTab({ purchases }: { purchases: PurchaseRow[] }) {
  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="space-y-3">
        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-border bg-background p-6 text-muted-foreground">
            Aun no encontramos registros en `ventas` con los campos del diccionario.
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
