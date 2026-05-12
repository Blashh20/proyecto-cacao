import { supabase } from "@/services/client"

export interface Project {
  id: number
  name: string
  location: string
  coordinates: { lat: number; lng: number }
  description: string
  hectares: number
  families: number
  yearStarted: number
  production: string
  variety: string
  image: string
  gallery?: ProjectGalleryImage[]
}

export interface ProjectGalleryImage {
  src: string
  alt: string
  source: string
  sourceUrl: string
}

export const defaultProjects: Project[] = []

interface SupabaseProjectRow {
  id: number
  nombre: string
  ubicacion: string
  latitud: number
  longitud: number
  descripcion: string
  hectareas: number
  familias: number
  anio_inicio: number
  produccion: string
  variedad: string
  imagen: string | null
}

export interface NewProjectInput {
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

function mapRowToProject(row: SupabaseProjectRow): Project {
  return {
    id: row.id,
    name: row.nombre,
    location: row.ubicacion,
    coordinates: { lat: row.latitud, lng: row.longitud },
    description: row.descripcion,
    hectares: row.hectareas,
    families: row.familias,
    yearStarted: row.anio_inicio,
    production: row.produccion,
    variety: row.variedad,
    image: row.imagen ?? "/images/cacao-pods.jpg",
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .rpc("obtener_proyectos");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [] as SupabaseProjectRow[]).map((row: SupabaseProjectRow) =>
    mapRowToProject(row)
  );
}

export async function createProject(project: NewProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .rpc("crear_proyecto", {
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
