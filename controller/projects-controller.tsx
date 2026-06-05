// ===============================
// controller/projects-controller.tsx
// ===============================

"use client"

<<<<<<< HEAD
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { createProject, defaultProjects, fetchProjects, type NewProjectInput, type Project, type ProjectGalleryImage } from "@/model/projects"
import { supabase } from "@/services/client"

export type { NewProjectInput, ProjectGalleryImage }
=======
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
>>>>>>> 4b76dcaa0942cc6b309006320f53e230826d6f3b

  isLoading: boolean
<<<<<<< HEAD
  addProject: (project: NewProjectInput) => Promise<void>
  updateProject: (id: number, project: Partial<NewProjectInput>) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  refreshProjects: () => Promise<void>
=======

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
>>>>>>> 4b76dcaa0942cc6b309006320f53e230826d6f3b
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
      setProjects(defaultProjects)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

<<<<<<< HEAD
    const load = async () => {
      try {
        const data = await fetchProjects()
        if (isMounted) setProjects(data)
      } catch {
        if (isMounted) setProjects(defaultProjects)
      } finally {
        if (isMounted) setIsLoading(false)
=======
    const loadProjects =
      async () => {
        try {
          const data =
            await fetchProjects()

          if (isMounted) {
            setProjects(
              ensureUniqueProjectIds(
                data
              )
            )
          }
        } catch (error) {
          console.error(
            "Error loading projects:",
            error
          )

          try {
            const localData =
              window.localStorage.getItem(
                STORAGE_KEY
              )

            if (
              localData &&
              isMounted
            ) {
              setProjects(
                ensureUniqueProjectIds(
                  JSON.parse(localData)
                )
              )
            }
          } catch (
            storageError
          ) {
            console.error(
              storageError
            )
          }
        } finally {
          if (isMounted) {
            setIsLoading(false)
          }
        }
>>>>>>> 4b76dcaa0942cc6b309006320f53e230826d6f3b
      }

    void load()
    return () => { isMounted = false }
  }, [])

<<<<<<< HEAD
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
=======
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
>>>>>>> 4b76dcaa0942cc6b309006320f53e230826d6f3b
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
<<<<<<< HEAD
  const context = useContext(ProjectsContext)
=======
  const context =
    useContext(
      ProjectsContext
    )

>>>>>>> 4b76dcaa0942cc6b309006320f53e230826d6f3b
  if (!context) {
    throw new Error(
      "useProjects must be used within a ProjectsProvider"
    )
  }
  return context
}
