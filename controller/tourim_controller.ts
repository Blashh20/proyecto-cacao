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
  operator?: string
  points: RoutePointDto[]
}

type RawRoutePointRow = Record<string, unknown>

const ROUTE_POINTS_RPCS = ["obtener_rutas_turisticas_detalle", "obtener_puntos_de_ruta", "obtener_puntos_ruta", "get_route_points", "get_tourism_data"]

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
    // Fallback directo a tablas reales: rutas_turisticas + puntos_de_ruta (+ puntos_geograficos opcional)
    const routesRes = await supabase
      .from("rutas_turisticas")
      .select("id_ruta, nombre_ruta, distancia_total, nivel_dificultad, tiempo_estimado")
      .order("fecha_creacion", { ascending: true })

    if (routesRes.error || !Array.isArray(routesRes.data)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("No se pudieron consultar rutas_turisticas:", routesRes.error ?? lastError)
      }
      return []
    }

    const pointsRes = await supabase
      .from("puntos_de_ruta")
      .select("id_punto_ruta, id_ruta, id_punto_geografico, orden")
      .order("orden", { ascending: true })

    const geoRes = await supabase
      .from("rutas_turisticas")
      .select("id_punto, nombre_lugar, latitud, longitud, tipo_punto")

    const geoMap = new Map<string, Record<string, unknown>>()
    if (!geoRes.error && Array.isArray(geoRes.data)) {
      for (const row of geoRes.data as Record<string, unknown>[]) {
        const id = asString(row.id_punto)
        if (id) geoMap.set(id, row)
      }
    }

    const groupedPoints = new Map<string, RoutePointDto[]>()
    if (!pointsRes.error && Array.isArray(pointsRes.data)) {
      for (const p of pointsRes.data as Record<string, unknown>[]) {
        const routeId = asString(p.id_ruta)
        const geoId = asString(p.id_punto_geografico)
        const geo = geoMap.get(geoId)
        const routePoint: RoutePointDto = {
          id: asString(p.id_punto_ruta) || `${routeId}-${asNumber(p.orden, 0)}`,
          name: asString(geo?.nombre_lugar) || `Punto ${asNumber(p.orden, 0)}`,
          latitude: asNumber(geo?.latitud, 0),
          longitude: asNumber(geo?.longitud, 0),
          type: asString(geo?.tipo_punto, "Punto"),
          order: asNumber(p.orden, 0),
        }
        if (!groupedPoints.has(routeId)) groupedPoints.set(routeId, [])
        groupedPoints.get(routeId)!.push(routePoint)
      }
    }

    return (routesRes.data as Record<string, unknown>[]).map((r) => {
      const routeId = asString(r.id_ruta)
      const points = (groupedPoints.get(routeId) ?? []).sort((a, b) => a.order - b.order)
      return {
        id: routeId,
        name: asString(r.nombre_ruta, "Ruta turística"),
        difficulty: asString(r.nivel_dificultad, "MEDIA"),
        duration: asString(r.tiempo_estimado, ""),
        distanceKm: asNumber(r.distancia_total, 0),
        points,
      }
    })
  }

  // Formato nuevo esperado:
  // [{ id_ruta, nombre_ruta, distancia_km, dificultad, empresa_operadora, puntos:[...] }]
  const nestedRoutes = rows as Array<Record<string, unknown>>
  if (
    nestedRoutes.length > 0 &&
    Array.isArray(nestedRoutes[0]?.puntos) &&
    (nestedRoutes[0]?.id_ruta || nestedRoutes[0]?.nombre_ruta)
  ) {
    return nestedRoutes.map((route) => {
      const pointsRaw = Array.isArray(route.puntos) ? (route.puntos as Record<string, unknown>[]) : []
      return {
        id: asString(route.id_ruta),
        name: asString(route.nombre_ruta, "Ruta turística"),
        difficulty: asString(route.dificultad, "MEDIA"),
        duration: asString(route.tiempo_estimado ?? route.duracion, ""),
        distanceKm: asNumber(route.distancia_km ?? route.distancia_total, 0),
        operator: asString(route.empresa_operadora, ""),
        points: pointsRaw
          .map((point) => ({
            id: asString(point.id_punto, `${asString(route.id_ruta)}-${asNumber(point.orden_visita, 0)}`),
            name: asString(point.nombre_lugar, "Punto de ruta"),
            latitude: asNumber(point.latitud, 0),
            longitude: asNumber(point.longitud, 0),
            type: asString(point.tipo_punto, "Punto"),
            order: asNumber(point.orden_visita, 0),
          }))
          .sort((a, b) => a.order - b.order),
      }
    })
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
