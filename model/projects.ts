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

export interface SupabaseProjectRow {
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

export function mapRowToProject(row: SupabaseProjectRow): Project {
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
