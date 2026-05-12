"use client"

import type { NewProjectInput, Project, SupabaseProjectRow } from "@/model/projects"
import { mapRowToProject } from "@/model/projects"
import { supabase } from "@/services/client"

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.rpc("detalle_completo_empresas_mapa")
  console.log(data)

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as SupabaseProjectRow[]).map((row) => mapRowToProject(row))
}

export async function createProject(project: NewProjectInput): Promise<Project> {
  const { data, error } = await supabase.rpc("crear_proyecto", {
    nombre: project.name,
    ubicacion: project.location,
    latitud: project.lat,
    longitud: project.lng,
    descripcion: project.description,
    hectareas: project.hectares,
    familias: project.families,
    anio_inicio: project.yearStarted,
    produccion: project.production,
    variedad: project.variety,
    imagen: project.image,
  })

  if (error) {
    throw error
  }

  return mapRowToProject(data)
}
