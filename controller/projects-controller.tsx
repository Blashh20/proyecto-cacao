"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { createProject, defaultProjects, fetchProjects, type NewProjectInput, type Project } from "@/model/projects"

interface ProjectsContextType {
  projects: Project[]
  isLoading: boolean
  addProject: (project: NewProjectInput) => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadProjects = async () => {
      try {
        const data = await fetchProjects()
        if (isMounted) {
          setProjects(data)
        }
      } catch {
        if (isMounted) {
          setProjects(defaultProjects)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => ({
      projects,
      isLoading,
      addProject: async (project: NewProjectInput) => {
        const createdProject = await createProject(project)
        setProjects((currentProjects) => [...currentProjects, createdProject])
      },
    }),
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

