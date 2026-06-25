// ===============================
// controller/projects-controller.tsx
// ===============================

"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  createProject,
  deleteProject as deleteProjectRemote,
  fetchProjects,
  updateProject as updateProjectRemote,
} from "@/services/projects-service"

import type {
  NewProjectInput,
  Project,
} from "@/model/projects"

interface ProjectsContextType {
  projects: Project[]

  isLoading: boolean

  addProject: (
    project: NewProjectInput
  ) => Promise<void>

  updateProject: (
    id: number,
    projectUpdate: Partial<NewProjectInput>
  ) => Promise<void>

  deleteProject: (
    id: number
  ) => Promise<void>

  refreshProjects: () => Promise<void>
}

const ProjectsContext =
  createContext<
    ProjectsContextType | undefined
  >(undefined)

export function ProjectsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [projects, setProjects] =
    useState<Project[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const data = await fetchProjects()
      setProjects(data)
    } catch {
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadProjects =
      async () => {
        try {
          const data =
            await fetchProjects()

          if (isMounted) {
            setProjects(data)
          }
        } catch (error) {
          console.error(
            "Error loading projects:",
            error
          )

          if (isMounted) {
            setProjects([])
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
      }

    void loadProjects()
    return () => { isMounted = false }
  }, [])

  const value = useMemo(
    () => ({
      projects,

      isLoading,

      addProject: async (
        project: NewProjectInput
      ) => {
        try {
          await createProject(project)
          await loadProjects()
        } catch (error) {
          console.error(
            "Error saving project:",
            error
          )
          throw error
        }
      },

      updateProject: async (
        id: number,
        projectUpdate: Partial<NewProjectInput>
      ) => {
        const currentProject =
          projects.find(
            (project) =>
              project.id === id
          )

        if (!currentProject) {
          throw new Error(
            "Proyecto no encontrado"
          )
        }

        await updateProjectRemote(
          currentProject,
          projectUpdate
        )
        await loadProjects()
      },

      deleteProject: async (
        id: number
      ) => {
        const currentProject =
          projects.find(
            (project) =>
              project.id === id
          )

        if (!currentProject) {
          throw new Error(
            "Proyecto no encontrado"
          )
        }

        await deleteProjectRemote(
          currentProject
        )
        await loadProjects()
      },
      refreshProjects: loadProjects,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, projects]
  )

  return (
    <ProjectsContext.Provider
      value={value}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context =
    useContext(
      ProjectsContext
    )

  if (!context) {
    throw new Error(
      "useProjects must be used within a ProjectsProvider"
    )
  }
  return context
}
