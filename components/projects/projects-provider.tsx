"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { defaultProjects, type Project } from "@/lib/projects"

interface NewProjectInput {
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
}

interface ProjectsContextType {
  projects: Project[]
  addProject: (project: NewProjectInput) => void
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
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
          },
        ])
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
