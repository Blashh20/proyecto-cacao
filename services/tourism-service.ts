import { supabase } from "@/services/client"

export type RoutePointDto = {
  id_punto: string
  nombre_lugar: string
  latitud: number
  longitud: number
  tipo_punto: string
  orden: number
  id_ruta_punto?: string
  id_region?: string
  description?: string
  image?: string
}

export type TouristRouteDto = {
  id_ruta: string
  nombre_ruta: string
  distancia_total: number
  tiempo_estimado: string
  nivel_dificultad: string
  id_empresa?: string
  nombre_empresa?: string
  imagen_url?: string
  images?: string[]   // parsed from imagen_url comma-separated
  activa?: boolean
  destacada?: boolean
  calificacion?: number
  points: RoutePointDto[]
}

type RawRow = Record<string, unknown>

const ROUTE_POINTS_RPCS = [
  "obtener_rutas_turisticas_detalle",
  "obtener_puntos_de_ruta",
  "obtener_puntos_ruta",
  "get_route_points",
  "get_tourism_data",
]

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

const buildRoutesFromTables = (
  routeRows: RawRow[],
  routePointRows: RawRow[],
  geoPointRows: RawRow[],
  companiesById = new Map<string, string>()
): TouristRouteDto[] => {
  const geoPointsById = new Map<string, RawRow>()

  for (const geoPoint of geoPointRows) {
    const pointId = asString(geoPoint.id_punto_geografico ?? geoPoint.id_punto)
    if (pointId) geoPointsById.set(pointId, geoPoint)
  }

  const pointsByRouteId = new Map<string, RoutePointDto[]>()

  for (const relation of routePointRows) {
    const routeId = asString(relation.id_ruta)
    const pointId = asString(relation.id_punto_geografico ?? relation.id_punto)
    if (!routeId || !pointId) continue

    const geoPoint = geoPointsById.get(pointId)
    const order = asNumber(relation.orden, 0)

    const routePoint: RoutePointDto = {
      id_punto: pointId,
      id_ruta_punto: asString(relation.id_ruta_punto) || undefined,
      nombre_lugar: asString(geoPoint?.nombre_lugar, `Punto ${order || 1}`),
      latitud: asNumber(geoPoint?.latitud, 0),
      longitud: asNumber(geoPoint?.longitud, 0),
      tipo_punto: asString(geoPoint?.tipo_punto, "Punto"),
      id_region: asString(geoPoint?.id_region) || undefined,
      orden: order,
    }

    if (!pointsByRouteId.has(routeId)) pointsByRouteId.set(routeId, [])
    pointsByRouteId.get(routeId)!.push(routePoint)
  }

  return routeRows.map((route) => {
    const routeId = asString(route.id_ruta)
    const companyId = asString(route.id_empresa)
    const points = (pointsByRouteId.get(routeId) ?? []).sort((a, b) => a.orden - b.orden)

    const rawImagenUrl = asString(route.imagen_url)
    const images = rawImagenUrl ? rawImagenUrl.split(",").map(s => s.trim()).filter(Boolean) : undefined

    return {
      id_ruta: routeId,
      nombre_ruta: asString(route.nombre_ruta, "Ruta turística"),
      distancia_total: asNumber(route.distancia_total, 0),
      tiempo_estimado: asString(route.tiempo_estimado, ""),
      nivel_dificultad: asString(route.nivel_dificultad, "Medio"),
      id_empresa: companyId || undefined,
      nombre_empresa: companiesById.get(companyId) || undefined,
      imagen_url: rawImagenUrl || undefined,
      images,
      destacada: route.destacada === true,
      activa: route.activa !== false,
      calificacion: asNumber(route.calificacion, 5),
      points,
    }
  })
}

const getRoutesFromDictionaryTables = async () => {
  const routesRes = await supabase
    .from("rutas_turisticas")
    .select("id_ruta, nombre_ruta, distancia_total, tiempo_estimado, nivel_dificultad, id_empresa, nit_empresa, imagen_url, destacada, activa, calificacion")
    .order("nombre_ruta", { ascending: true })

  if (routesRes.error || !Array.isArray(routesRes.data)) {
    return { routes: null, error: routesRes.error }
  }

  const routeRows = routesRes.data as RawRow[]
  if (routeRows.length === 0) {
    return { routes: [], error: null }
  }

  const companyIds = [...new Set(routeRows.map((route) => asString(route.id_empresa)).filter(Boolean))]
  const companiesById = new Map<string, string>()

  if (companyIds.length > 0) {
    const companiesRes = await supabase
      .from("empresas")
      .select("id_empresa, nombre_comercial")
      .in("id_empresa", companyIds)

    if (!companiesRes.error && Array.isArray(companiesRes.data)) {
      for (const company of companiesRes.data as RawRow[]) {
        const companyId = asString(company.id_empresa)
        const companyName = asString(company.nombre_comercial)
        if (companyId && companyName) companiesById.set(companyId, companyName)
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("No se pudieron consultar empresas:", companiesRes.error)
    }
  }

  const routeIds = routeRows.map((route) => asString(route.id_ruta)).filter(Boolean)
  const routePointsRes = await supabase
    .from("puntos_de_ruta")
    .select("id_punto_ruta, id_ruta, id_punto_geografico, orden")
    .in("id_ruta", routeIds)
    .order("orden", { ascending: true })


  if (routePointsRes.error || !Array.isArray(routePointsRes.data)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("No se pudieron consultar puntos_de_ruta:", routePointsRes.error)
    }

    return { routes: buildRoutesFromTables(routeRows, [], [], companiesById), error: null }
  }

  const routePointRows = routePointsRes.data as RawRow[]
  const pointIds = [...new Set(routePointRows.map((point) => asString(point.id_punto_geografico ?? point.id_punto)).filter(Boolean))]
  let geoPointRows: RawRow[] = []

  if (pointIds.length > 0) {
    const geoPointsRes = await supabase
      .from("puntos_geograficos")
      .select("id_punto_geografico, nombre_lugar, latitud, longitud, tipo_punto, id_region")
      .in("id_punto_geografico", pointIds)

    if (!geoPointsRes.error && Array.isArray(geoPointsRes.data)) {
      geoPointRows = geoPointsRes.data as RawRow[]
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("No se pudieron consultar puntos_geograficos:", geoPointsRes.error)
    }
  }

  return { routes: buildRoutesFromTables(routeRows, routePointRows, geoPointRows, companiesById), error: null }
}

const normalizeFlatRow = (row: RawRow) => ({
  routeId: asString(row.id_ruta ?? row.route_id ?? row.idRuta),
  routeName: asString(row.nombre_ruta ?? row.route_name ?? row.ruta),
  difficulty: asString(row.nivel_dificultad ?? row.difficulty ?? row.dificultad, "Medio"),
  duration: asString(row.tiempo_estimado ?? row.duration ?? row.duracion, ""),
  distanceTotal: asNumber(row.distancia_total ?? row.distance_km ?? row.distancia_km ?? row.distancia, 0),
  companyId: asString(row.id_empresa ?? row.company_id, ""),
  companyName: asString(row.nombre_empresa ?? row.nombre_comercial ?? row.company_name ?? row.empresa, ""),
  routePointId: asString(row.id_ruta_punto ?? row.id_punto_ruta, ""),
  pointId: asString(row.id_punto ?? row.point_id ?? row.idPunto),
  pointName: asString(row.nombre_lugar ?? row.point_name ?? row.nombre_punto),
  latitude: asNumber(row.latitud ?? row.latitude, 0),
  longitude: asNumber(row.longitud ?? row.longitude, 0),
  pointType: asString(row.tipo_punto ?? row.point_type, "Punto"),
  regionId: asString(row.id_region ?? row.region_id, ""),
  order: asNumber(row.orden ?? row.order ?? row.orden_visita, 0),
  description: asString(row.descripcion_experiencia ?? row.descripcion ?? row.description, ""),
  image: asString(row.url_foto ?? row.image ?? row.imagen, ""),
})

const buildRoutesFromRpcRows = (rows: RawRow[]): TouristRouteDto[] => {
  const nestedRoutes = rows

  if (
    nestedRoutes.length > 0 &&
    Array.isArray(nestedRoutes[0]?.puntos) &&
    (nestedRoutes[0]?.id_ruta || nestedRoutes[0]?.nombre_ruta)
  ) {
    return nestedRoutes.map((route) => {
      const pointsRaw = Array.isArray(route.puntos) ? (route.puntos as RawRow[]) : []

      return {
        id_ruta: asString(route.id_ruta),
        nombre_ruta: asString(route.nombre_ruta, "Ruta turística"),
        distancia_total: asNumber(route.distancia_total ?? route.distancia_km, 0),
        tiempo_estimado: asString(route.tiempo_estimado ?? route.duracion, ""),
        nivel_dificultad: asString(route.nivel_dificultad ?? route.dificultad, "Medio"),
        id_empresa: asString(route.id_empresa) || undefined,
        nombre_empresa: asString(route.nombre_empresa ?? route.nombre_comercial ?? route.empresa) || undefined,
        points: pointsRaw
          .map((point) => ({
            id_punto: asString(point.id_punto, `${asString(route.id_ruta)}-${asNumber(point.orden ?? point.orden_visita, 0)}`),
            id_ruta_punto: asString(point.id_ruta_punto ?? point.id_punto_ruta) || undefined,
            nombre_lugar: asString(point.nombre_lugar, "Punto de ruta"),
            latitud: asNumber(point.latitud, 0),
            longitud: asNumber(point.longitud, 0),
            tipo_punto: asString(point.tipo_punto, "Punto"),
            id_region: asString(point.id_region) || undefined,
            orden: asNumber(point.orden ?? point.orden_visita, 0),
          }))
          .sort((a, b) => a.orden - b.orden),
      }
    })
  }

  const routesById = new Map<string, TouristRouteDto>()

  for (const row of rows) {
    const normalized = normalizeFlatRow(row)
    if (!normalized.routeId || !normalized.pointId) continue

    if (!routesById.has(normalized.routeId)) {
      routesById.set(normalized.routeId, {
        id_ruta: normalized.routeId,
        nombre_ruta: normalized.routeName || "Ruta turística",
        distancia_total: normalized.distanceTotal,
        tiempo_estimado: normalized.duration,
        nivel_dificultad: normalized.difficulty,
        id_empresa: normalized.companyId || undefined,
        nombre_empresa: normalized.companyName || undefined,
        points: [],
      })
    }

    routesById.get(normalized.routeId)!.points.push({
      id_punto: normalized.pointId,
      id_ruta_punto: normalized.routePointId || undefined,
      nombre_lugar: normalized.pointName || "Punto de ruta",
      latitud: normalized.latitude,
      longitud: normalized.longitude,
      tipo_punto: normalized.pointType,
      id_region: normalized.regionId || undefined,
      orden: normalized.order,
      description: normalized.description || undefined,
      image: normalized.image || undefined,
    })
  }

  return [...routesById.values()]
    .map((route) => ({
      ...route,
      points: [...route.points].sort((a, b) => a.orden - b.orden),
    }))
    .filter((route) => route.points.length > 0)
}

const getRoutesFromRpcFallback = async () => {
  let lastError: unknown = null

  for (const rpcName of ROUTE_POINTS_RPCS) {
    const { data, error } = await supabase.rpc(rpcName)

    if (!error && Array.isArray(data)) {
      return buildRoutesFromRpcRows(data as RawRow[])
    }

    lastError = error
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn("No se pudieron consultar RPCs de turismo:", lastError)
  }

  return null
}

export async function getTourismRoutePoints(): Promise<TouristRouteDto[]> {
  const tableResult = await getRoutesFromDictionaryTables()

  if (tableResult.routes) {
    return tableResult.routes
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn("No se pudieron consultar tablas de turismo:", tableResult.error)
  }

  return (await getRoutesFromRpcFallback()) ?? []
}
