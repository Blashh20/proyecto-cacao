"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { defaultProjects, type Project, type ProjectGalleryImage } from "@/model/projects"

export interface NewProjectInput {
  id?: number
  name: string
  location: string
  lat: number
  lng: number
  description: string
  hectares: number
  families: number
  yearStarted: number
  production: string
  variety: string
  image: string
  gallery?: ProjectGalleryImage[]
}

interface ProjectsContextType {
  projects: Project[]
  addProject: (project: NewProjectInput) => void
  updateProject: (id: number, project: Partial<NewProjectInput>) => void
  deleteProject: (id: number) => void
}

const STORAGE_KEY = "cacaotera-projects"
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(defaultProjects)

  useEffect(() => {
    const storedProjects = window.localStorage.getItem(STORAGE_KEY)

    if (!storedProjects) return

    try {
      const parsedProjects = JSON.parse(storedProjects) as Project[]

      if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
        setProjects(parsedProjects)
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch (error) {
      console.error("No se pudieron guardar los proyectos en localStorage:", error)
      alert("Memoria llena: Las imágenes que intentaste subir son demasiado grandes para el almacenamiento local del navegador. Los cambios no se guardarán permanentemente. Intenta eliminar imágenes de otros proyectos.")
    }
  }, [projects])

  const value = useMemo(
    () => ({
      projects,
      addProject: (project: NewProjectInput) => {
        setProjects((currentProjects) => [
          ...currentProjects,
          {
            id: currentProjects.length === 0 ? 1 : Math.max(...currentProjects.map((item) => item.id)) + 1,
            name: project.name,
            location: project.location,
            coordinates: { lat: project.lat, lng: project.lng },
            description: project.description,
            hectares: project.hectares,
            families: project.families,
            yearStarted: project.yearStarted,
            production: project.production,
            variety: project.variety,
            image: project.image,
            gallery: project.gallery || [],
          },
        ])
      },
      updateProject: (id: number, projectUpdate: Partial<NewProjectInput>) => {
        setProjects((currentProjects) =>
          currentProjects.map((proj) => {
            if (proj.id === id) {
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
                gallery: projectUpdate.gallery ?? proj.gallery,
              }
            }
            return proj
          })
        )
      },
      deleteProject: (id: number) => {
        setProjects((currentProjects) => currentProjects.filter((proj) => proj.id !== id))
      },
    }),
    [projects]
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

