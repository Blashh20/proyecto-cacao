"use client"

import { useMemo, useState, useEffect, useRef, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { parseProduction, calculateYield } from "@/controller/admin-projects-panel-controller"
import dynamic from "next/dynamic"
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
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react"

import { supabase } from "@/services/client"

import { useAuth } from "@/controller/auth-controller"
import { useProjects } from "@/controller/projects-controller"
import type { Project, ProjectGalleryImage } from "@/model/projects"

const AdminMapLeaflet = dynamic(() => import("@/ui/components/admin-map-leaflet").then((mod) => mod.AdminMapLeaflet), {
  ssr: false,
})

interface FormState {
  id: number | null
  name: string
  location: string
  lat: string
  lng: string
  description: string
  hectares: string
  families: string
  yearStarted: string
  production: string
  variety: string
  image: string
  status: string
  gallery: ProjectGalleryImage[]
}

type AdminSection = "resumen" | "proyectos" | "produccion" | "mercado" | "importar"

const initialFormState: FormState = {
  id: null,
  name: "",
  location: "",
  lat: "",
  lng: "",
  description: "",
  hectares: "",
  families: "",
  yearStarted: "",
  production: "",
  variety: "",
  image: "/images/cacao-pods.jpg",
  status: "Activo",
  gallery: [],
}

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"

const adminSections: { id: AdminSection; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "resumen", label: "Resumen", icon: BarChart3 },
  { id: "proyectos", label: "Proyectos", icon: Sprout },
  { id: "produccion", label: "Produccion", icon: Factory },
  { id: "mercado", label: "Mercado", icon: Globe2 },
  { id: "importar", label: "Importar CSV", icon: Upload },
]

export function AdminProjectsPanel() {
  const { user } = useAuth()
  const { projects, addProject, updateProject, deleteProject, refreshProjects } = useProjects()
  const [form, setForm] = useState<FormState>(initialFormState)
  const [message, setMessage] = useState("")
  const [activeSection, setActiveSection] = useState<AdminSection>("resumen")
  const [isSaving, setIsSaving] = useState(false)

  const metrics = useMemo(() => {
    const totalProjects = projects.length
    const totalFamilies = projects.reduce((sum: number, project: Project) => sum + project.families, 0)
    const totalHectares = projects.reduce((sum: number, project: Project) => sum + project.hectares, 0)
    const totalProduction = projects.reduce((sum: number, project: Project) => sum + parseProduction(project.production), 0)
    const avgProduction = totalProjects > 0 ? Math.round(totalProduction / totalProjects) : 0
    const newestYear = projects.reduce((max: number, project: Project) => Math.max(max, project.yearStarted), 0)

    return {
      totalProjects,
      totalFamilies,
      totalHectares,
      totalProduction,
      avgProduction,
      newestYear,
    }
  }, [projects])

  const marketData = useMemo(
    () => [
      {
        title: "Mix comercial",
        value: "48% exportacion",
        description: "Mayor salida para cafe especial, cacao premium y derivados con valor agregado.",
      },
      {
        title: "Canal con mayor crecimiento",
        value: "Retail especializado",
        description: "Tiendas gourmet y marcas bean-to-bar con crecimiento sostenido.",
      },
      {
        title: "Oportunidad prioritaria",
        value: "Cafe y cacao premium",
        description: "Categorias de origen y trazabilidad con mejor margen comercial.",
      },
      {
        title: "Riesgo comercial",
        value: "Volatilidad de precios",
        description: "Conviene monitorear costo logístico, clima y demanda internacional.",
      },
    ],
    []
  )

  if (user?.role !== "admin") {
    return null
  }

  const handleChange =
    (field: keyof FormState) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((current) => ({ ...current, [field]: event.target.value }))
      }

  const handleMapClick = (lat: number, lng: number) => {
    setForm((current) => ({
      ...current,
      lat: String(lat),
      lng: String(lng),
    }))
  }

  const handleProjectSelect = (project: Project) => {
    setForm({
      id: project.id,
      name: project.name,
      location: project.location,
      lat: String(project.coordinates.lat),
      lng: String(project.coordinates.lng),
      description: project.description,
      hectares: String(project.hectares),
      families: String(project.families),
      yearStarted: String(project.yearStarted),
      production: project.production,
      variety: project.variety,
      image: project.image,
      status: project.status,
      gallery: project.gallery || [],
    })
    document.getElementById("admin-form")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleDelete = async () => {
    if (form.id && window.confirm("¿Seguro que deseas eliminar este proyecto?")) {
      try {
        await deleteProject(form.id)
        setForm(initialFormState)
        setMessage("Proyecto eliminado correctamente.")
      } catch {
        setMessage("Error al eliminar el proyecto. Verifica permisos en Supabase.")
      }
    }
  }

  const handleCancelEdit = () => {
    setForm(initialFormState)
    setMessage("")
  }

  const compressImage = (file: File, callback: (base64String: string) => void) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height
        const MAX_DIMENSION = 800

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width
            width = MAX_DIMENSION
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height
            height = MAX_DIMENSION
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          // Comprimir a WebP con 70% de calidad para ahorrar espacio
          callback(canvas.toDataURL("image/webp", 0.7))
        } else {
          callback(e.target?.result as string)
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
    callback: (base64String: string) => void
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      compressImage(file, callback)
    }
  }

  const addGalleryImage = () => {
    setForm((current) => ({
      ...current,
      gallery: [...current.gallery, { src: "", alt: "", source: "", sourceUrl: "" }],
    }))
  }

  const updateGalleryImage = (index: number, field: keyof ProjectGalleryImage, value: string) => {
    setForm((current) => {
      const newGallery = [...current.gallery]
      newGallery[index] = { ...newGallery[index], [field]: value }
      return { ...current, gallery: newGallery }
    })
  }

  const removeGalleryImage = (index: number) => {
    setForm((current) => ({
      ...current,
      gallery: current.gallery.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage("")

    const projectData = {
      name: form.name.trim(),
      location: form.location.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      description: form.description.trim(),
      hectares: Number(form.hectares),
      families: Number(form.families),
      yearStarted: Number(form.yearStarted),
      production: form.production.trim(),
      variety: form.variety.trim(),
      image: form.image.trim() || "/images/cacao-pods.jpg",
      status: form.status,
      gallery: form.gallery,
    }

    try {
      if (form.id) {
        await updateProject(form.id, projectData)
        setMessage("Proyecto actualizado correctamente.")
      } else {
        await addProject(projectData)
        setMessage("Proyecto agregado correctamente.")
      }
      setForm(initialFormState)
      setActiveSection("proyectos")
    } catch {
      setMessage("Error al guardar el proyecto. Verifica permisos en Supabase.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusUpdate = async (project: Project, status: "Aprobado" | "Rechazado") => {
    await updateProject(project.id, { status })
    if (form.id === project.id) {
      setForm((current) => ({ ...current, status }))
    }
    setMessage(`Proyecto ${status.toLowerCase()} correctamente.`)
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
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
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
                    {projects.slice(-5).reverse().map((project: Project) => (
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
              <div className="space-y-8" id="admin-form">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-forest/5 to-forest/10 p-4">
                  <div className="absolute left-8 top-8 z-[100] rounded-lg border border-border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                    <p className="text-sm font-medium text-foreground">Mapa interactivo de gestión</p>
                    <p className="text-xs text-muted-foreground">Haz clic en el mapa para agregar punto o selecciona un pin para editar</p>
                  </div>
                  <div className="h-[400px] w-full relative z-0">
                    <AdminMapLeaflet
                      projects={projects}
                      selectedProjectId={form.id}
                      onProjectSelect={handleProjectSelect}
                      onMapClick={handleMapClick}
                      newPointCoordinates={form.lat && form.lng && !form.id ? { lat: Number(form.lat), lng: Number(form.lng) } : null}
                    />
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-card p-6 md:p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PlusCircle className="text-forest" size={24} />
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{form.id ? "Editar proyecto" : "Agregar nuevo proyecto"}</h3>
                          <p className="text-sm text-muted-foreground">Completa la informacion para mostrarlo en el mapa y en el panel.</p>
                        </div>
                      </div>
                      {form.id && (
                        <button type="button" onClick={handleCancelEdit} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                          Cancelar edición
                        </button>
                      )}
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
                      <Field label="Estado de revision">
                        <select
                          value={form.status}
                          onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                          className={inputClassName}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Aprobado">Aprobado</option>
                          <option value="Rechazado">Rechazado</option>
                          <option value="Activo">Activo</option>
                        </select>
                      </Field>
                      <Field label="Imagen Principal">
                        <div className="flex gap-2 items-center h-[50px]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (str) => setForm(c => ({ ...c, image: str })))}
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest/10 file:text-forest hover:file:bg-forest/20"
                          />
                          {form.image && form.image.startsWith("data:image") && <span className="text-xs text-forest">Imagen lista</span>}
                        </div>
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

                    <div className="mt-8 border-t border-border pt-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">Imágenes de Galería</h4>
                        <button type="button" onClick={addGalleryImage} className="text-sm font-medium text-forest hover:text-forest-dark">+ Añadir imagen</button>
                      </div>
                      {form.gallery.map((img, index) => (
                        <div key={index} className="mb-4 rounded-xl border border-border bg-background p-4 relative">
                          <button type="button" onClick={() => removeGalleryImage(index)} className="absolute right-3 top-3 text-xs font-semibold text-red-500 hover:text-red-700">Eliminar</button>
                          <div className="grid gap-4 md:grid-cols-2 mt-4">
                            <Field label="Imagen">
                              <div className="flex flex-col gap-2">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, (str) => updateGalleryImage(index, "src", str))}
                                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest/10 file:text-forest hover:file:bg-forest/20"
                                />
                                {img.src && img.src.startsWith("data:image") && <img src={img.src} alt="Preview" className="h-12 w-full max-w-32 object-cover rounded" />}
                              </div>
                            </Field>
                            <Field label="Texto Alternativo"><input value={img.alt} onChange={(e) => updateGalleryImage(index, "alt", e.target.value)} required className={inputClassName} /></Field>
                            <Field label="Fuente (ej. Wikimedia)"><input value={img.source} onChange={(e) => updateGalleryImage(index, "source", e.target.value)} required className={inputClassName} /></Field>
                            <Field label="URL de la fuente"><input value={img.sourceUrl} onChange={(e) => updateGalleryImage(index, "sourceUrl", e.target.value)} required className={inputClassName} /></Field>
                          </div>
                        </div>
                      ))}
                      {form.gallery.length === 0 && <p className="text-sm text-muted-foreground">No hay imágenes en la galería. Se usará la imagen principal por defecto.</p>}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <PlusCircle size={18} />
                        {isSaving ? "Guardando..." : form.id ? "Actualizar proyecto" : "Guardar proyecto"}
                      </button>
                      {form.id && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 text-red-500 px-6 py-3 font-semibold transition-colors hover:bg-red-500/20"
                        >
                          Eliminar proyecto
                        </button>
                      )}
                    </div>
                  </form>

                  <DashboardCard
                    title="Listado reciente"
                    icon={<Sprout size={20} className="text-forest" />}
                    description="Revision rapida de los proyectos registrados."
                  >
                    <div className="max-h-[560px] space-y-4 overflow-y-auto pr-2">
                      {projects.slice().reverse().map((project: Project) => (
                        <article key={project.id} className="rounded-2xl border border-border bg-background p-4 cursor-pointer hover:border-forest/50 transition-colors" onClick={() => handleProjectSelect(project)}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground">{project.name}</h4>
                              <p className="text-sm text-muted-foreground">{project.location}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <StatusBadge status={project.status} />
                              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                                {project.yearStarted}
                              </span>
                            </div>
                          </div>
                          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{project.description}</p>
                          {project.status === "Pendiente" ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  void handleStatusUpdate(project, "Aprobado")
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-forest px-3 py-2 text-xs font-semibold text-white hover:bg-forest-dark"
                              >
                                <CheckCircle2 size={14} />
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  void handleStatusUpdate(project, "Rechazado")
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                              >
                                <AlertCircle size={14} />
                                Rechazar
                              </button>
                            </div>
                          ) : null}
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

            {activeSection === "importar" ? (
              <CsvImportSection onImportSuccess={refreshProjects} />
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

  function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase()
    const className =
      normalized.includes("rechaz")
        ? "bg-red-500/10 text-red-300"
        : normalized.includes("aprob") || normalized.includes("activo")
          ? "bg-forest/10 text-forest"
          : "bg-amber-500/10 text-amber-300"

    return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{status}</span>
  }

  function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
        {children}
      </label>
    )
  }

  // ─── CSV Import ────────────────────────────────────────────────────────────

  const CSV_TEMPLATES = {
    proyectos: {
      headers: ["nombre", "ubicacion", "latitud", "longitud", "descripcion", "hectareas", "familias", "anio_inicio", "produccion", "variedad", "imagen"],
      sample: ["Proyecto Huila Norte", "Pitalito, Huila", "1.8762", "-76.0502", "Cacao fino de aroma en zona montanosa", "150", "45", "2019", "45 toneladas/ano", "CCN-51", "/images/cacao-pods.jpg"],
    },
    productos_derivados: {
      headers: ["nombre_derivado", "descripcion", "imagen_url", "tag", "rating"],
      sample: ["Cacao en polvo premium", "Cacao fino con notas frutales", "/images/cacao-beans.jpg", "Premium", "4.8"],
    },
  } as const

  type CsvTable = keyof typeof CSV_TEMPLATES

  function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return { headers: [], rows: [] }

    const splitRow = (line: string): string[] => {
      const result: string[] = []
      let cur = ""
      let inQ = false
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ }
        else if (ch === "," && !inQ) { result.push(cur.trim()); cur = "" }
        else { cur += ch }
      }
      result.push(cur.trim())
      return result
    }

    const headers = splitRow(lines[0])
    const rows = lines.slice(1).filter(Boolean).map((line) => {
      const vals = splitRow(line)
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]))
    })
    return { headers, rows }
  }

  function downloadTemplate(table: CsvTable) {
    const { headers, sample } = CSV_TEMPLATES[table]
    const csv = [headers.join(","), sample.join(",")].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `plantilla_${table}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function CsvImportSection({ onImportSuccess }: { onImportSuccess: () => Promise<void> }) {
    const [table, setTable] = useState<CsvTable>("proyectos")
    const [headers, setHeaders] = useState<string[]>([])
    const [rows, setRows] = useState<Record<string, string>[]>([])
    const [fileName, setFileName] = useState("")
    const [importing, setImporting] = useState(false)
    const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
    const [colWarning, setColWarning] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const reset = () => { setHeaders([]); setRows([]); setFileName(""); setResults(null); setColWarning(null) }

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setFileName(file.name)
      setResults(null)
      setColWarning(null)
      const reader = new FileReader()
      reader.onload = (ev) => {
        const { headers: h, rows: r } = parseCSV(ev.target?.result as string)
        setHeaders(h)
        setRows(r)
        // Validate columns match expected template
        const expected = [...CSV_TEMPLATES[table].headers] as string[]
        const missing = expected.filter((col) => !h.includes(col))
        const extra = h.filter((col) => !expected.includes(col))
        if (missing.length > 0 || extra.length > 0) {
          const parts: string[] = []
          if (missing.length) parts.push(`Columnas faltantes: ${missing.join(", ")}`)
          if (extra.length) parts.push(`Columnas desconocidas (se ignorarán): ${extra.join(", ")}`)
          setColWarning(parts.join(" | "))
        }
      }
      reader.readAsText(file)
    }

    const handleImport = async () => {
      if (!rows.length) return
      // Block import if required columns are missing
      const expected = [...CSV_TEMPLATES[table].headers] as string[]
      const missing = expected.filter((col) => !headers.includes(col))
      if (missing.length > 0) {
        setResults({ success: 0, errors: [`No se puede importar: faltan las columnas requeridas: ${missing.join(", ")}`] })
        return
      }
      setImporting(true)
      setResults(null)
      const errors: string[] = []
      let success = 0

      if (table === "proyectos") {
        const payload = rows.map((row) => ({
          nombre: row.nombre ?? "",
          ubicacion: row.ubicacion ?? "",
          latitud: Number(row.latitud ?? 0),
          longitud: Number(row.longitud ?? 0),
          descripcion: row.descripcion ?? "",
          hectareas: Number(row.hectareas ?? 0),
          familias: Number(row.familias ?? 0),
          anio_inicio: Number(row.anio_inicio ?? 0),
          produccion: row.produccion ?? "",
          variedad: row.variedad ?? "",
          imagen: row.imagen || "/images/cacao-pods.jpg",
        }))
        const { error } = await supabase.from("proyectos").insert(payload)
        if (error) {
          errors.push(error.message)
        } else {
          success = payload.length
          await onImportSuccess()
        }
      } else {
        const payload = rows.map((row) => ({
          nombre_derivado: row.nombre_derivado ?? "",
          description: row.descripcion ?? "",
          imagen_url: row.imagen_url || "/images/cacao-beans.jpg",
          tag: row.tag ?? "",
          rating: Number(row.rating ?? 0),
        }))
        const { error } = await supabase.from("productos_derivados").insert(payload)
        if (error) errors.push(error.message)
        else success = payload.length
      }

      setResults({ success, errors })
      setImporting(false)
      if (inputRef.current) inputRef.current.value = ""
      setRows([])
      setHeaders([])
      setFileName("")
    }

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10">
              <Upload size={20} className="text-forest" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Importar datos desde CSV</h3>
              <p className="text-sm text-muted-foreground">Sube un archivo CSV para insertar registros masivamente en Supabase.</p>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            {(["proyectos", "productos_derivados"] as CsvTable[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTable(t); reset() }}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${table === t
                    ? "border-forest bg-forest text-white shadow-lg shadow-forest/20"
                    : "border-border text-muted-foreground hover:border-forest/40 hover:text-foreground"
                  }`}
              >
                {t === "proyectos" ? "Proyectos" : "Productos"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => downloadTemplate(table)}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-forest/30 bg-forest/5 px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-forest/10"
          >
            <Download size={16} />
            Descargar plantilla CSV
          </button>

          <div className="mb-6 rounded-2xl border border-border bg-background p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Columnas requeridas</p>
            <div className="flex flex-wrap gap-2">
              {CSV_TEMPLATES[table].headers.map((h) => (
                <span key={h} className="rounded-full bg-forest/10 px-3 py-1 text-xs font-mono text-forest">{h}</span>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">Seleccionar archivo CSV</span>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-forest/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest hover:file:bg-forest/20"
            />
            {fileName && (
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <FileText size={13} />
                {fileName} — {rows.length} fila(s) detectada(s)
              </p>
            )}
          </label>
        </div>

        {/* Column mismatch warning */}
        {colWarning && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Advertencia de columnas</p>
              <p className="mt-1 text-sm text-amber-200/80">{colWarning}</p>
              <p className="mt-1 text-xs text-amber-200/60">Descarga la plantilla CSV para ver el formato correcto.</p>
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h4 className="mb-4 font-semibold text-foreground">
              Vista previa ({Math.min(rows.length, 5)} de {rows.length} filas)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-border/50 transition-colors hover:bg-forest/5">
                      {headers.map((h) => (
                        <td key={h} className="max-w-[160px] truncate px-3 py-2 text-foreground">{row[h]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={18} />
              {importing ? "Importando..." : `Importar ${rows.length} registro(s)`}
            </button>
          </div>
        )}

        {results && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4">
            <h4 className="font-semibold text-foreground">Resultado de la importacion</h4>
            {results.success > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-forest/30 bg-forest/10 px-4 py-3">
                <CheckCircle2 size={20} className="shrink-0 text-forest" />
                <p className="text-sm text-foreground">{results.success} registro(s) importados correctamente.</p>
              </div>
            )}
            {results.errors.map((err, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">{err}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
