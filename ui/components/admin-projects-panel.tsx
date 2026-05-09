"use client"

import type { ReactNode } from "react"
import {
  BarChart3,
  Factory,
  Globe2,
  Leaf,
  LineChart,
  PlusCircle,
  ShieldCheck,
  Sprout,
  TrendingUp,
} from "lucide-react"

import {
  calculateYield,
  type AdminSection,
  marketData,
  useAdminProjectsPanelController,
} from "@/controller/admin-projects-panel-controller"

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"

const adminSections: { id: AdminSection; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "resumen", label: "Resumen", icon: BarChart3 },
  { id: "proyectos", label: "Proyectos", icon: Sprout },
  { id: "produccion", label: "Produccion", icon: Factory },
  { id: "mercado", label: "Mercado", icon: Globe2 },
]

export function AdminProjectsPanel() {
  const {
    user,
    projects,
    isLoading,
    form,
    message,
    activeSection,
    isSaving,
    metrics,
    setActiveSection,
    handleChange,
    handleSubmit,
  } = useAdminProjectsPanelController()

  if (user?.role !== "admin") {
    return null
  }

  return (
    <section id="admin" className="border-y border-border bg-background py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold uppercase tracking-widest">Administrador</span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">Panel de administracion</h2>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Gestiona proyectos, revisa estadisticas de produccion y consulta un resumen rapido del mercado desde un solo panel.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricChip label="Proyectos" value={String(metrics.totalProjects)} />
              <MetricChip label="Produccion" value={`${metrics.totalProduction} t`} />
              <MetricChip label="Familias" value={String(metrics.totalFamilies)} />
              <MetricChip label="Hectareas" value={String(metrics.totalHectares)} />
            </div>
          </div>

          <div className="mb-8 overflow-x-auto rounded-2xl border border-border bg-card p-2">
            <div className="flex min-w-max gap-2">
              {adminSections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-forest text-white shadow-lg shadow-forest/20"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <Icon size={17} />
                    {section.label}
                  </button>
                )
              })}
            </div>
          </div>

          {activeSection === "resumen" ? (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-6 md:grid-cols-2">
                <DashboardCard
                  title="Capacidad productiva"
                  icon={<Factory size={20} className="text-forest" />}
                  description="Vision general de la operacion actual."
                >
                  <div className="grid grid-cols-2 gap-4">
                    <StatBox label="Produccion total" value={`${metrics.totalProduction} t`} />
                    <StatBox label="Promedio por proyecto" value={`${metrics.avgProduction} t`} />
                    <StatBox label="Hectareas activas" value={`${metrics.totalHectares} ha`} />
                    <StatBox label="Ultimo inicio" value={String(metrics.newestYear)} />
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Impacto territorial"
                  icon={<Leaf size={20} className="text-forest" />}
                  description="Cobertura social y operativa de los proyectos."
                >
                  <div className="space-y-4">
                    <ProgressRow label="Familias vinculadas" value={metrics.totalFamilies} max={800} />
                    <ProgressRow label="Hectareas manejadas" value={metrics.totalHectares} max={3000} />
                    <ProgressRow label="Proyectos publicados" value={metrics.totalProjects} max={12} />
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Desempeno comercial"
                  icon={<TrendingUp size={20} className="text-forest" />}
                  description="Indicadores rapidos para decisiones de negocio."
                >
                  <div className="grid gap-3">
                    <InlineInsight label="Ticket premium" value="Alto" note="Mayor valor en cafe especial, cacao fino y derivados." />
                    <InlineInsight label="Rotacion esperada" value="Media-Alta" note="Buen potencial en temporadas de exportacion." />
                    <InlineInsight label="Diversificacion" value="Activa" note="Portafolio entre cafe, cacao y lineas institucionales." />
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Resumen de mercado"
                  icon={<LineChart size={20} className="text-forest" />}
                  description="Lectura rapida del contexto comercial."
                >
                  <div className="space-y-3">
                    {marketData.slice(0, 3).map((item) => (
                      <article key={item.title} className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.title}</p>
                        <p className="mt-1 font-semibold text-foreground">{item.value}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      </article>
                    ))}
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard
                title="Ultimos proyectos"
                icon={<Sprout size={20} className="text-forest" />}
                description="Verificacion rapida de lo mas reciente en la plataforma."
              >
                <div className="space-y-4">
                  {projects.slice(-5).reverse().map((project) => (
                    <article key={project.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.location}</p>
                        </div>
                        <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                          {project.yearStarted}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground">
                        <span className="rounded-full bg-forest/10 px-3 py-1">{project.production}</span>
                        <span className="rounded-full bg-forest/10 px-3 py-1">{project.families} familias</span>
                      </div>
                    </article>
                  ))}
                </div>
              </DashboardCard>
            </div>
          ) : null}

          {activeSection === "proyectos" ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <PlusCircle className="text-forest" size={24} />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Agregar nuevo proyecto</h3>
                    <p className="text-sm text-muted-foreground">Completa la informacion para mostrarlo en el mapa y en el panel.</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nombre del proyecto">
                    <input value={form.name} onChange={handleChange("name")} required className={inputClassName} />
                  </Field>
                  <Field label="Ubicacion">
                    <input value={form.location} onChange={handleChange("location")} required className={inputClassName} />
                  </Field>
                  <Field label="Latitud">
                    <input type="number" step="0.0001" value={form.lat} onChange={handleChange("lat")} required className={inputClassName} />
                  </Field>
                  <Field label="Longitud">
                    <input type="number" step="0.0001" value={form.lng} onChange={handleChange("lng")} required className={inputClassName} />
                  </Field>
                  <Field label="Hectareas">
                    <input type="number" min="1" value={form.hectares} onChange={handleChange("hectares")} required className={inputClassName} />
                  </Field>
                  <Field label="Familias beneficiadas">
                    <input type="number" min="1" value={form.families} onChange={handleChange("families")} required className={inputClassName} />
                  </Field>
                  <Field label="Ano de inicio">
                    <input type="number" min="2000" max="2100" value={form.yearStarted} onChange={handleChange("yearStarted")} required className={inputClassName} />
                  </Field>
                  <Field label="Produccion">
                    <input value={form.production} onChange={handleChange("production")} required className={inputClassName} placeholder="45 toneladas/ano" />
                  </Field>
                  <Field label="Variedad">
                    <input value={form.variety} onChange={handleChange("variety")} required className={inputClassName} />
                  </Field>
                  <Field label="Ruta de imagen">
                    <input value={form.image} onChange={handleChange("image")} className={inputClassName} placeholder="/images/cacao-pods.jpg" />
                  </Field>
                </div>

                <Field label="Descripcion">
                  <textarea
                    value={form.description}
                    onChange={handleChange("description")}
                    required
                    rows={5}
                    className={`${inputClassName} resize-none`}
                  />
                </Field>

                {message ? (
                  <div className="rounded-2xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">{message}</div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSaving || isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark"
                >
                  <PlusCircle size={18} />
                  {isSaving ? "Guardando..." : "Guardar proyecto"}
                </button>
              </form>

              <DashboardCard
                title="Listado reciente"
                icon={<Sprout size={20} className="text-forest" />}
                description="Revision rapida de los proyectos registrados."
              >
                <div className="space-y-4">
                  {projects.slice().reverse().map((project) => (
                    <article key={project.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.location}</p>
                        </div>
                        <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                          {project.yearStarted}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground">
                        <span className="rounded-full bg-forest/10 px-3 py-1">{project.hectares} ha</span>
                        <span className="rounded-full bg-forest/10 px-3 py-1">{project.families} familias</span>
                        <span className="rounded-full bg-forest/10 px-3 py-1">{project.variety}</span>
                        <span className="rounded-full bg-forest/10 px-3 py-1">{project.production}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </DashboardCard>
            </div>
          ) : null}

          {activeSection === "produccion" ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <DashboardCard
                title="Indicadores de produccion"
                icon={<Factory size={20} className="text-forest" />}
                description="Base operativa para seguimiento interno."
                className="lg:col-span-2"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <StatBox label="Produccion total" value={`${metrics.totalProduction} t`} />
                  <StatBox label="Promedio por proyecto" value={`${metrics.avgProduction} t`} />
                  <StatBox label="Rendimiento estimado" value={`${calculateYield(metrics.totalProduction, metrics.totalHectares)} t/ha`} />
                </div>
                <div className="mt-6 space-y-4">
                  {projects.map((project) => (
                    <article key={project.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.location} · {project.hectares} ha · {project.families} familias
                          </p>
                        </div>
                        <span className="rounded-full bg-forest/10 px-3 py-1 text-sm font-semibold text-forest">
                          {project.production}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard
                title="Notas operativas"
                icon={<Leaf size={20} className="text-forest" />}
                description="Puntos de control sugeridos."
              >
                <div className="space-y-3">
                  <TipCard text="Monitorea fermentacion y secado por lote para mantener perfiles consistentes." />
                  <TipCard text="Relaciona volumen producido con hectareas y clima para detectar variaciones." />
                  <TipCard text="Prioriza proyectos con mejor rendimiento para replicas tecnicas." />
                </div>
              </DashboardCard>
            </div>
          ) : null}

          {activeSection === "mercado" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {marketData.map((item) => (
                <DashboardCard
                  key={item.title}
                  title={item.title}
                  icon={<Globe2 size={20} className="text-forest" />}
                  description={item.description}
                >
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Usa este indicador como referencia para decisiones comerciales, priorizacion de portafolio y conversaciones con clientes.
                  </p>
                </DashboardCard>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function DashboardCard({
  title,
  description,
  icon,
  children,
  className = "",
}: {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-3xl border border-border bg-card p-6 md:p-8 ${className}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function ProgressRow({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
      <div className="h-3 rounded-full bg-background">
        <div className="h-3 rounded-full bg-forest" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function InlineInsight({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">{value}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </article>
  )
}

function TipCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">{text}</div>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}

