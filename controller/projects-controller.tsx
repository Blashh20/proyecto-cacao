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
  fetchProjects,
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
  ) => void

  deleteProject: (
    id: number
  ) => void

  refreshProjects: () => Promise<void>
}

const ProjectsContext =
  createContext<
    ProjectsContextType | undefined
  >(undefined)

const STORAGE_KEY =
  "empresas:mapa"

function ensureUniqueProjectIds(
  input: Project[]
): Project[] {
  const used = new Set<number>()

  let nextId =
    input.length === 0
      ? 1
      : Math.max(
          ...input.map((p) => p.id)
        ) + 1

  return input.map((project) => {
    if (!used.has(project.id)) {
      used.add(project.id)
      return project
    }

    const reassigned = {
      ...project,
      id: nextId++,
    }

    used.add(reassigned.id)

    return reassigned
  })
}

function getStoredProjects(): Project[] {
  try {
    const localData =
      window.localStorage.getItem(
        STORAGE_KEY
      )

    if (!localData) return []

    const parsed =
      JSON.parse(localData)

    return Array.isArray(parsed)
      ? parsed
      : []
  } catch (error) {
    console.error(
      "No se pudieron leer proyectos locales:",
      error
    )
    return []
  }
}

function mergeProjects(
  remoteProjects: Project[],
  storedProjects: Project[]
): Project[] {
  const remoteIds =
    new Set(
      remoteProjects.map(
        (project) => project.id
      )
    )

  return ensureUniqueProjectIds([
    ...remoteProjects,
    ...storedProjects.filter(
      (project) =>
        !remoteIds.has(project.id)
    ),
  ])
}

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
      setProjects(
        mergeProjects(
          data,
          getStoredProjects()
        )
      )
    } catch {
      setProjects(getStoredProjects())
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
            setProjects(
              mergeProjects(
                data,
                getStoredProjects()
              )
            )
          }
        } catch (error) {
          console.error(
            "Error loading projects:",
            error
          )

          if (isMounted) {
            setProjects(getStoredProjects())
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

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(projects)
      )
    } catch (error) {
      console.error(
        "No se pudieron guardar datos:",
        error
      )
    }
  }, [projects])

  const value = useMemo(
    () => ({
      projects,

      isLoading,

      addProject: async (
        project: NewProjectInput
      ) => {
        try {
          const savedProject =
            await createProject(
              project
            )

          setProjects(
            (
              currentProjects
            ) => [
              ...currentProjects,
              savedProject,
            ]
          )
        } catch (error) {
          console.error(
            "Error saving project:",
            error
          )
        }
      },

      updateProject: (
        id: number,
        projectUpdate: Partial<NewProjectInput>
      ) => {
        setProjects(
          (
            currentProjects
          ) =>
            currentProjects.map(
              (proj) => {
                if (
                  proj.id === id
                ) {
                  return {
                    ...proj,

                    name:
                      projectUpdate.name ??
                      proj.name,

                    nit:
                      projectUpdate.nit ??
                      proj.nit,

                    status:
                      projectUpdate.status ??
                      proj.status,

                    ownerId:
                      projectUpdate.ownerId ??
                      proj.ownerId,

                    ownerEmail:
                      projectUpdate.ownerEmail ??
                      proj.ownerEmail,

                    location:
                      projectUpdate.location ??
                      proj.location,

                    coordinates:
                      {
                        lat:
                          projectUpdate.lat ??
                          proj
                            .coordinates
                            .lat,

                        lng:
                          projectUpdate.lng ??
                          proj
                            .coordinates
                            .lng,
                      },

                    localType:
                      projectUpdate.localType ??
                      proj.localType,

                    phone:
                      projectUpdate.phone ??
                      proj.phone,

                    description:
                      projectUpdate.description ??
                      proj.description,

                    image:
                      projectUpdate.image ??
                      proj.image,

                    hectares:
                      projectUpdate.hectares ??
                      proj.hectares,

                    families:
                      projectUpdate.families ??
                      proj.families,

                    yearStarted:
                      projectUpdate.yearStarted ??
                      proj.yearStarted,

                    production:
                      projectUpdate.production ??
                      proj.production,

                    variety:
                      projectUpdate.variety ??
                      proj.variety,

                    catalog:
                      projectUpdate.catalog ??
                      proj.catalog,

                    distributionPoints:
                      projectUpdate.distributionPoints ??
                      proj.distributionPoints,

                    gallery:
                      projectUpdate.gallery ??
                      proj.gallery,
                  }
                }

                return proj
              }
            )
        )
      },

      deleteProject: (
        id: number
      ) => {
        setProjects(
          (
            currentProjects
          ) =>
            currentProjects.filter(
              (proj) =>
                proj.id !== id
            )
        )
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
