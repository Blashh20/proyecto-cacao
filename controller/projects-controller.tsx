"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { createProject, defaultProjects, fetchProjects, type NewProjectInput, type Project, type ProjectGalleryImage } from "@/model/projects"
import { supabase } from "@/services/client"

export type { NewProjectInput, ProjectGalleryImage }

interface ProjectsContextType {
  projects: Project[]
  isLoading: boolean
  addProject: (project: NewProjectInput) => Promise<void>
  updateProject: (id: number, project: Partial<NewProjectInput>) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  refreshProjects: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const [isLoading, setIsLoading] = useState(true)

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const data = await fetchProjects()
      setProjects(data)
    } catch {
      setProjects(defaultProjects)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const data = await fetchProjects()
        if (isMounted) setProjects(data)
      } catch {
        if (isMounted) setProjects(defaultProjects)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    return () => { isMounted = false }
  }, [])

  const value = useMemo(
    () => ({
      projects,
      isLoading,
      addProject: async (project: NewProjectInput) => {
        const created = await createProject(project)
        setProjects((prev) => [...prev, created])
      },
      updateProject: async (id: number, projectUpdate: Partial<NewProjectInput>) => {
        const updateData: Record<string, unknown> = {}
        if (projectUpdate.name !== undefined) updateData.nombre = projectUpdate.name
        if (projectUpdate.location !== undefined) updateData.ubicacion = projectUpdate.location
        if (projectUpdate.lat !== undefined) updateData.latitud = projectUpdate.lat
        if (projectUpdate.lng !== undefined) updateData.longitud = projectUpdate.lng
        if (projectUpdate.description !== undefined) updateData.descripcion = projectUpdate.description
        if (projectUpdate.hectares !== undefined) updateData.hectareas = projectUpdate.hectares
        if (projectUpdate.families !== undefined) updateData.familias = projectUpdate.families
        if (projectUpdate.yearStarted !== undefined) updateData.anio_inicio = projectUpdate.yearStarted
        if (projectUpdate.production !== undefined) updateData.produccion = projectUpdate.production
        if (projectUpdate.variety !== undefined) updateData.variedad = projectUpdate.variety
        if (projectUpdate.image !== undefined) updateData.imagen = projectUpdate.image

        const { error } = await supabase.from("proyectos").update(updateData).eq("id", id)
        if (error) throw error

        setProjects((prev) =>
          prev.map((proj) => {
            if (proj.id !== id) return proj
            return {
              ...proj,
              name: projectUpdate.name ?? proj.name,
              location: projectUpdate.location ?? proj.location,
              coordinates: {
                lat: projectUpdate.lat ?? proj.coordinates.lat,
                lng: projectUpdate.lng ?? proj.coordinates.lng,
              },
              description: projectUpdate.description ?? proj.description,
              hectares: projectUpdate.hectares ?? proj.hectares,
              families: projectUpdate.families ?? proj.families,
              yearStarted: projectUpdate.yearStarted ?? proj.yearStarted,
              production: projectUpdate.production ?? proj.production,
              variety: projectUpdate.variety ?? proj.variety,
              image: projectUpdate.image ?? proj.image,
            }
          })
        )
      },
      deleteProject: async (id: number) => {
        const { error } = await supabase.from("proyectos").delete().eq("id", id)
        if (error) throw error
        setProjects((prev) => prev.filter((proj) => proj.id !== id))
      },
      refreshProjects: loadProjects,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, projects]
  )

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider")
  }
  return context
}
