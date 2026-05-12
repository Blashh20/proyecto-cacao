import { supabase } from "@/services/client"

export type RoutePointDto = {
  id: string
  name: string
  latitude: number
  longitude: number
  type: string
  order: number
  description?: string
  image?: string
}

export type TouristRouteDto = {
  id: string
  name: string
  difficulty: string
  duration: string
  distanceKm: number
  points: RoutePointDto[]
}

type RawRoutePointRow = Record<string, unknown>

const ROUTE_POINTS_RPCS = ["obtener_puntos_de_ruta", "obtener_puntos_ruta", "get_route_points", "get_tourism_data"]

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value)

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

const normalizeRow = (row: RawRoutePointRow) => {
  const routeId = asString(row.id_ruta ?? row.route_id ?? row.idRuta)
  const pointId = asString(row.id_punto ?? row.point_id ?? row.idPunto)

  return {
    routeId,
    routeName: asString(row.nombre_ruta ?? row.route_name ?? row.ruta),
    difficulty: asString(row.nivel_dificultad ?? row.difficulty ?? "MEDIO"),
    duration: asString(row.tiempo_estimado ?? row.duration ?? ""),
    distanceKm: asNumber(row.distancia_total ?? row.distance_km ?? row.distancia ?? 0),
    pointId,
    pointName: asString(row.nombre_lugar ?? row.point_name ?? row.nombre_punto),
    latitude: asNumber(row.latitud ?? row.latitude),
    longitude: asNumber(row.longitud ?? row.longitude),
    pointType: asString(row.tipo_punto ?? row.point_type ?? "Punto"),
    order: asNumber(row.orden ?? row.order ?? 0),
    description: asString(row.descripcion_experiencia ?? row.descripcion ?? row.description, ""),
    image: asString(row.url_foto ?? row.image ?? row.imagen, ""),
  }
}

export async function getTourismRoutePoints(): Promise<TouristRouteDto[]> {
  let rows: RawRoutePointRow[] | null = null
  let lastError: unknown = null

  for (const rpcName of ROUTE_POINTS_RPCS) {
    const { data, error } = await supabase.rpc(rpcName)
    if (!error && Array.isArray(data)) {
      rows = data as RawRoutePointRow[]
      break
    }
    lastError = error
  }

  if (!rows) {
    console.error("Error fetching route points:", lastError)
    return []
  }

  const routesMap = new Map<string, TouristRouteDto>()

  for (const row of rows) {
    const normalized = normalizeRow(row)
    if (!normalized.routeId || !normalized.pointId) continue

    if (!routesMap.has(normalized.routeId)) {
      routesMap.set(normalized.routeId, {
        id: normalized.routeId,
        name: normalized.routeName || "Ruta turística",
        difficulty: normalized.difficulty,
        duration: normalized.duration,
        distanceKm: normalized.distanceKm,
        points: [],
      })
    }

    routesMap.get(normalized.routeId)!.points.push({
      id: normalized.pointId,
      name: normalized.pointName || "Punto de ruta",
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      type: normalized.pointType,
      order: normalized.order,
      description: normalized.description || undefined,
      image: normalized.image || undefined,
    })
  }

  const routes = [...routesMap.values()].map((route) => ({
    ...route,
    points: [...route.points].sort((a, b) => a.order - b.order),
  }))

  return routes.filter((route) => route.points.length > 0)
}

