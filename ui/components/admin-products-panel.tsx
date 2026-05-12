"use client"

import { PlusCircle, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

import { useAdminProductsPanelController } from "@/controller/admin-products-panel-controller"

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"

export function AdminProductsPanel() {
  const { user, form, isSaving, message, errorMessage, handleChange, handleSubmit } = useAdminProductsPanelController()

  if (user?.role !== "admin") {
    return null
  }

  return (
    <section id="admin-productos" className="border-y border-border bg-background py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
              <ShieldCheck size={18} />
              <span className="text-sm font-semibold uppercase tracking-widest">Administrador</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">Agregar productos</h2>
            <p className="mt-2 text-muted-foreground">Este formulario inserta directamente en Supabase (`productos_derivados`).</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre del producto">
                <input value={form.nombre_derivado} onChange={handleChange("nombre_derivado")} required className={inputClassName} />
              </Field>
              <Field label="Tag">
                <input value={form.tag} onChange={handleChange("tag")} required className={inputClassName} placeholder="Premium" />
              </Field>
              <Field label="Rating">
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange("rating")} required className={inputClassName} />
              </Field>
              <Field label="URL de imagen">
                <input value={form.imagen_url} onChange={handleChange("imagen_url")} required className={inputClassName} />
              </Field>
            </div>

            <Field label="Descripcion">
              <textarea value={form.descripcion} onChange={handleChange("descripcion")} rows={4} required className={`${inputClassName} resize-none`} />
            </Field>

            {message ? <p className="rounded-2xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">{message}</p> : null}
            {errorMessage ? <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              <PlusCircle size={18} />
              {isSaving ? "Guardando..." : "Guardar producto"}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
