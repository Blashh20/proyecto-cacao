"use client"

import { MapPin, Send, Upload } from "lucide-react"
import { useMemo, type ChangeEvent, type Dispatch, type SetStateAction } from "react"

import type { Project } from "@/model/projects"
import { LOCATION_CATALOG, PRODUCTION_RANGES, PROJECT_TYPES, CACAO_VARIETIES, getMunicipalitiesByDepartment } from "@/ui/components/dashboard/profile-catalogs"
import { ProfileInput } from "@/ui/components/dashboard/profile-input"
import { ProfileSelect } from "@/ui/components/dashboard/profile-select"

type ProjectSubmissionForm = {
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

// Permite enviar un proyecto productivo para revision y muestra las solicitudes creadas.
export function ProjectSubmissionTab({
  form,
  setForm,
  projects,
  onSubmit,
}: {
  form: ProjectSubmissionForm
  setForm: Dispatch<SetStateAction<ProjectSubmissionForm>>
  projects: Project[]
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const municipalities = useMemo(() => getMunicipalitiesByDepartment(form.department), [form.department])

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, image: (reader.result as string) || "/images/cacao-pods.jpg" }))
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
          <ProfileInput label="Nombre del proyecto" value={form.name} onChange={(value) => setForm((s) => ({ ...s, name: value }))} />
          <ProfileSelect
            label="Tipo de operacion"
            value={form.localType}
            onChange={(value) => setForm((s) => ({ ...s, localType: value }))}
            options={PROJECT_TYPES.map((item: string) => ({ value: item, label: item }))}
          />
          <ProfileSelect
            label="Departamento"
            value={form.department}
            onChange={(value) => setForm((s) => ({ ...s, department: value, municipality: "" }))}
            options={LOCATION_CATALOG.map((item) => ({ value: item.department, label: item.department }))}
            placeholder="Selecciona departamento"
          />
          <ProfileSelect
            label="Municipio"
            value={form.municipality}
            onChange={(value) => setForm((s) => ({ ...s, municipality: value }))}
            options={municipalities.map((item) => ({ value: item, label: item }))}
            placeholder={form.department ? "Selecciona municipio" : "Primero elige departamento"}
            disabled={!form.department}
          />
          <ProfileInput label="Latitud" type="number" value={form.lat} onChange={(value) => setForm((s) => ({ ...s, lat: value }))} />
          <ProfileInput label="Longitud" type="number" value={form.lng} onChange={(value) => setForm((s) => ({ ...s, lng: value }))} />
          <ProfileInput label="Hectareas" type="number" value={form.hectares} onChange={(value) => setForm((s) => ({ ...s, hectares: value }))} />
          <ProfileInput label="Familias beneficiadas" type="number" value={form.families} onChange={(value) => setForm((s) => ({ ...s, families: value }))} />
          <ProfileInput label="Ano de inicio" type="number" value={form.yearStarted} onChange={(value) => setForm((s) => ({ ...s, yearStarted: value }))} />
          <ProfileSelect
            label="Produccion estimada"
            value={form.production}
            onChange={(value) => setForm((s) => ({ ...s, production: value }))}
            options={PRODUCTION_RANGES.map((item) => ({ value: item, label: item }))}
            placeholder="Selecciona rango"
          />
          <ProfileSelect
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
