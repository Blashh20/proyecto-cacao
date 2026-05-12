import { supabase } from "@/services/client"

import type { CatalogProduct, DistributionPoint, NewProjectInput, Project } from "@/model/projects"

type EmpresaPayload = {
  id_empresa?: string | null
  nombre?: string | null
  nit?: string | null
  estado?: string | null
  anio_inicio?: number | string | null
  produccion?: string | null
  puntos_distribucion?: Array<{
    id?: string | null
    nombre_local?: string | null
    direccion?: string | null
    tipo?: string | null
    telefono?: string | null
    lat?: number | string | null
    lng?: number | string | null
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
}

function hashStringToInt(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function transformEmpresaToProject(data: EmpresaPayload, index: number): Project {
  const firstPoint = data.puntos_distribucion?.[0] ?? null
  const idSource = data.id_empresa ?? `empresa-${index}`

  return {
    id: hashStringToInt(String(idSource)),
    name: data.nombre ?? "Empresa sin nombre",
    nit: data.nit ?? "",
    status: data.estado ?? "",
    location: firstPoint?.direccion ?? "Sin punto de distribución",
    // Tu payload actual no trae coordenadas; aplicamos centro estable.
    coordinates: {
      lat: asNumber(firstPoint?.lat, 10.75),
      lng: asNumber(firstPoint?.lng, -73.75),
    },
    localType: firstPoint?.tipo ?? "",
    phone: firstPoint?.telefono ?? "",
    description: data.catalogo_productos?.[0]?.producto?.descripcion ?? "Sin descripción disponible.",
    hectares: 0,
    families: 0,
    yearStarted: asNumber(data.anio_inicio, 2026),
    production: data.produccion ?? "0",
    variety: data.catalogo_productos?.[0]?.producto?.nombre ?? "Sin variedad",
    image: "/images/default-business.jpg",
    catalog:
      data.catalogo_productos?.map(
        (item): CatalogProduct => ({
          id_catalog: String(item.id_catalogo ?? ""),
          price: asNumber(item.precio, 0),
          cost: asNumber(item.costo, 0),
          product: {
            name: item.producto?.nombre ?? "",
            category: item.producto?.categoria ?? "",
            description: item.producto?.descripcion ?? "",
          },
        })
      ) ?? [],
    distributionPoints:
      data.puntos_distribucion?.map(
        (point): DistributionPoint => ({
          id: String(point.id ?? ""),
          name: point.nombre_local ?? "",
          address: point.direccion ?? "",
          type: point.tipo ?? "",
          phone: point.telefono ?? "",
          coordinates: {
            lat: asNumber(point.lat, 10.75),
            lng: asNumber(point.lng, -73.75),
          },
        })
      ) ?? [],
    gallery: [],
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.rpc("detalle_completo_empresas_mapa")

  if (error) {
    throw error
  }

  const rows = (data ?? []) as Array<{ datos_empresa?: EmpresaPayload } | EmpresaPayload>

  return rows.map((item, index) => {
    const empresa = "datos_empresa" in item ? item.datos_empresa ?? {} : item
    return transformEmpresaToProject(empresa, index)
  })
}

export async function createProject(project: NewProjectInput): Promise<Project> {
  return {
    id: Date.now(),
    name: project.name,
    nit: project.nit,
    status: project.status,
    location: project.location,
    coordinates: {
      lat: project.lat,
      lng: project.lng,
    },
    localType: project.localType,
    phone: project.phone,
    description: project.description,
    hectares: Number(project.hectares ?? 0),
    families: Number(project.families ?? 0),
    yearStarted: Number(project.yearStarted ?? 2026),
    production: String(project.production ?? "0"),
    variety: project.variety ?? "Sin variedad",
    image: project.image,
    catalog: project.catalog ?? [],
    distributionPoints: project.distributionPoints ?? [],
    gallery: project.gallery ?? [],
  }
}

