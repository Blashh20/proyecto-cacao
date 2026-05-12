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
  id?: number | string | null
  nombre?: string | null
  ubicacion?: string | null
  latitud?: number | string | null
  longitud?: number | string | null
  descripcion?: string | null
  hectareas?: number | string | null
  familias?: number | string | null
  anio_inicio?: number | string | null
  produccion?: string | null
  variedad?: string | null
  imagen?: string | null
  datos_empresa?: {
    id_empresa?: string | null
    nombre?: string | null
    nit?: string | null
    estado?: string | null
    puntos_distribucion?: Array<{
      id?: string | null
      nombre_local?: string | null
      direccion?: string | null
      tipo?: string | null
      telefono?: string | null
    }> | null
    catalogo_productos?: Array<{
      id_catalogo?: string | null
      precio?: number | string | null
      costo?: number | string | null
      producto?: {
        nombre?: string | null
        categoria?: string | null
        descripcion?: string | null
      } | null
    }> | null
  } | null
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

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function asString(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim().length > 0) return value
  return fallback
}

function hashStringToInt(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function mapRowToProject(row: SupabaseProjectRow, index = 0): Project {
  const empresa = row.datos_empresa ?? null
  const idSource = empresa?.id_empresa ?? row.id ?? `fallback-${index}`
  const idAsNumber = typeof idSource === "number" ? idSource : hashStringToInt(String(idSource))

  const firstPoint = empresa?.puntos_distribucion?.[0]
  const firstProduct = empresa?.catalogo_productos?.[0]?.producto

  const projectName = asString(empresa?.nombre ?? row.nombre, "Empresa sin nombre")
  const location = asString(firstPoint?.direccion ?? row.ubicacion, "Sin ubicación")
  const description = asString(
    firstProduct?.descripcion ?? row.descripcion,
    "Proyecto empresarial registrado en la plataforma."
  )
  const variety = asString(firstProduct?.nombre ?? row.variedad, "Sin variedad")
  const production = asString(row.produccion, "0")

  // La nueva función no trae lat/lng; usamos un centro estable con un pequeño offset por índice.
  const baseLat = 10.75
  const baseLng = -73.75
  const latOffset = (index % 7) * 0.01
  const lngOffset = (index % 7) * -0.01

  return {
    id: idAsNumber,
    name: projectName,
    location,
    coordinates: {
      lat: asNumber(row.latitud, baseLat + latOffset),
      lng: asNumber(row.longitud, baseLng + lngOffset),
    },
    description,
    hectares: asNumber(row.hectareas, 0),
    families: asNumber(row.familias, 0),
    yearStarted: asNumber(row.anio_inicio, 2026),
    production,
    variety,
    image: row.imagen ?? "/images/cacao-pods.jpg",
  }
}
