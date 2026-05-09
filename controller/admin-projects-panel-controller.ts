"use client"

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react"

import { useAuth } from "@/controller/auth-controller"
import { useProjects } from "@/controller/projects-controller"

export type AdminSection = "resumen" | "proyectos" | "produccion" | "mercado"

export interface FormState {
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
}

export interface AdminMetricSet {
  totalProjects: number
  totalFamilies: number
  totalHectares: number
  totalProduction: number
  avgProduction: number
  newestYear: number
}

export const initialFormState: FormState = {
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
}

export const marketData = [
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
    description: "Conviene monitorear costo logistico, clima y demanda internacional.",
  },
]

function parseProduction(value: string) {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 0
}

export function calculateYield(totalProduction: number, totalHectares: number) {
  if (!totalHectares) return "0.00"
  return (totalProduction / totalHectares).toFixed(2)
}

export function useAdminProjectsPanelController() {
  const { user } = useAuth()
  const { projects, addProject, isLoading } = useProjects()

  const [form, setForm] = useState<FormState>(initialFormState)
  const [message, setMessage] = useState("")
  const [activeSection, setActiveSection] = useState<AdminSection>("resumen")
  const [isSaving, setIsSaving] = useState(false)

  const metrics = useMemo<AdminMetricSet>(() => {
    const totalProjects = projects.length
    const totalFamilies = projects.reduce((sum, project) => sum + project.families, 0)
    const totalHectares = projects.reduce((sum, project) => sum + project.hectares, 0)
    const totalProduction = projects.reduce((sum, project) => sum + parseProduction(project.production), 0)
    const avgProduction = totalProjects > 0 ? Math.round(totalProduction / totalProjects) : 0
    const newestYear = projects.reduce((max, project) => Math.max(max, project.yearStarted), 0)

    return {
      totalProjects,
      totalFamilies,
      totalHectares,
      totalProduction,
      avgProduction,
      newestYear,
    }
  }, [projects])

  const handleChange = useCallback(
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setMessage("")
      setIsSaving(true)

      try {
        await addProject({
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
        })

        setForm(initialFormState)
        setMessage("Proyecto guardado correctamente en Supabase.")
        setActiveSection("proyectos")
      } catch {
        setMessage("No se pudo guardar el proyecto en Supabase. Verifica permisos y estructura de la tabla.")
      } finally {
        setIsSaving(false)
      }
    },
    [addProject, form]
  )

  return {
    user,
    projects,
    isLoading,
    form,
    message,
    activeSection,
    isSaving,
    metrics,
    marketData,
    setActiveSection,
    handleChange,
    handleSubmit,
  }
}
