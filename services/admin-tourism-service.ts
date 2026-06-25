import { supabase } from "@/services/client"

export type TourismRoutePoint = {
  id_punto_geografico?: string
  nombre_lugar: string
  latitud: number
  longitud: number
  tipo_punto: string
}

export type TourismRouteFormData = {
  nombre_ruta: string
  distancia_total: number
  nivel_dificultad: string
  tiempo_estimado: string
  nit_empresa: string
  imagen_url: string
  puntoA: TourismRoutePoint | null
  puntoB: TourismRoutePoint | null
}

export type SavedTourismRoute = {
  id_ruta: string
  nombre_ruta: string
  distancia_total: number
  nivel_dificultad: string
  tiempo_estimado: string
  nit_empresa: string
  imagen_url?: string
  destacada?: boolean
  activa?: boolean
}

const asString = (v: unknown) => (typeof v === "string" ? v : "")

// ─── Haversine distance (km) ───────────────────────────────────────────────
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Auto-estimate time based on distance + difficulty ─────────────────────
const SPEED_KMH: Record<string, number> = {
  bajo: 4.0,
  medio: 3.0,
  alto: 2.5,
  extremo: 2.0,
}

export function estimateTime(distanceKm: number, difficulty: string): string {
  const speed = SPEED_KMH[difficulty.toLowerCase()] ?? 3.0
  const totalMinutes = Math.round((distanceKm / speed) * 60)

  if (totalMinutes < 60) return `${totalMinutes} minutos`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remH = hours % 24
    return remH > 0 ? `${days} día${days > 1 ? "s" : ""} ${remH}h` : `${days} día${days > 1 ? "s" : ""}`
  }
  return mins > 0 ? `${hours} hora${hours > 1 ? "s" : ""} ${mins} min` : `${hours} hora${hours > 1 ? "s" : ""}`
}

// ─── Upsert a geographic point ─────────────────────────────────────────────
async function upsertGeoPoint(point: TourismRoutePoint): Promise<string | null> {
  if (point.id_punto_geografico) {
    const { error } = await supabase
      .from("puntos_geograficos")
      .update({
        nombre_lugar: point.nombre_lugar,
        latitud: point.latitud,
        longitud: point.longitud,
        tipo_punto: point.tipo_punto,
      })
      .eq("id_punto_geografico", point.id_punto_geografico)

    if (error) { console.error("Error updating geo point:", error); return null }
    return point.id_punto_geografico
  }

  const { data, error } = await supabase
    .from("puntos_geograficos")
    .insert({
      nombre_lugar: point.nombre_lugar,
      latitud: point.latitud,
      longitud: point.longitud,
      tipo_punto: point.tipo_punto,
    })
    .select("id_punto_geografico")
    .single()

  if (error || !data) { console.error("Error inserting geo point:", error); return null }
  return asString(data.id_punto_geografico)
}

// ─── Helper: check if error is a schema cache / column-not-found error ────────
function isSchemaColumnError(msg: string): boolean {
  return msg.includes("schema cache") || msg.includes("Could not find") || msg.includes("column")
}

// ─── Save (create or update) a tourism route ───────────────────────────────
export async function saveTourismRoute(
  formData: TourismRouteFormData,
  editingId?: string
): Promise<{ success: boolean; message: string; id?: string; imagenGuardada?: boolean }> {
  try {
    let routeId = editingId

    // Resolve id_empresa by nit_empresa from empresas table to maintain DB integrity
    let id_empresa: string | null = null
    if (formData.nit_empresa && formData.nit_empresa !== "N/A") {
      const { data: empData } = await supabase
        .from("empresas")
        .select("id_empresa")
        .eq("nit", formData.nit_empresa)
        .maybeSingle()
      if (empData) {
        id_empresa = empData.id_empresa
      }
    }

    const basePayload: Record<string, unknown> = {
      nombre_ruta: formData.nombre_ruta.trim(),
      distancia_total: formData.distancia_total,
      nivel_dificultad: formData.nivel_dificultad,
      tiempo_estimado: formData.tiempo_estimado.trim() || "Sin especificar",
      nit_empresa: formData.nit_empresa.trim() || "N/A",
      id_empresa,
      calificacion: 5,  // Default rating when creating a new route
    }

    // Try with imagen_url first; fallback without it if the column doesn't exist yet
    const routePayloadWithImg = { ...basePayload, imagen_url: formData.imagen_url || null }
    let imagenGuardada = false

    if (editingId) {
      let { error } = await supabase
        .from("rutas_turisticas")
        .update(routePayloadWithImg)
        .eq("id_ruta", editingId)

      if (error && isSchemaColumnError(error.message)) {
        // Column imagen_url doesn't exist yet — retry without it
        const fallback = await supabase
          .from("rutas_turisticas")
          .update(basePayload)
          .eq("id_ruta", editingId)
        error = fallback.error
      } else if (!error) {
        imagenGuardada = true
      }

      if (error) throw new Error(error.message)
    } else {
      let { data, error } = await supabase
        .from("rutas_turisticas")
        .insert(routePayloadWithImg)
        .select("id_ruta")
        .single()

      if (error && isSchemaColumnError(error.message)) {
        // Column imagen_url doesn't exist yet — retry without it
        const fallback = await supabase
          .from("rutas_turisticas")
          .insert(basePayload)
          .select("id_ruta")
          .single()
        data = fallback.data
        error = fallback.error
      } else if (!error) {
        imagenGuardada = true
      }

      if (error || !data) throw new Error(error?.message ?? "No se pudo crear la ruta")
      routeId = asString(data.id_ruta)
    }

    if (!routeId) throw new Error("No se pudo obtener el ID de la ruta")

    // Re-insert route points
    if (editingId) {
      await supabase.from("puntos_de_ruta").delete().eq("id_ruta", editingId)
    }

    const pointsToSave = [
      formData.puntoA ? { point: formData.puntoA, orden: 1 } : null,
      formData.puntoB ? { point: formData.puntoB, orden: 2 } : null,
    ].filter((p): p is { point: TourismRoutePoint; orden: number } => p !== null)

    for (const { point, orden } of pointsToSave) {
      const geoId = await upsertGeoPoint(point)
      if (!geoId) throw new Error(`No se pudo guardar el punto ${orden}`)

      const { error: linkError } = await supabase.from("puntos_de_ruta").insert({
        id_ruta: routeId,
        id_punto_geografico: geoId,
        orden,
      })

      if (linkError) throw new Error(linkError.message)
    }

    const successMsg = imagenGuardada
      ? (editingId ? "Ruta actualizada correctamente." : "Ruta creada correctamente.")
      : (editingId ? "Ruta actualizada (sin imágenes — agrega la columna imagen_url a la tabla rutas_turisticas en Supabase)." : "Ruta creada (sin imágenes — agrega la columna imagen_url a la tabla rutas_turisticas en Supabase).")

    return {
      success: true,
      message: successMsg,
      id: routeId,
      imagenGuardada,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { success: false, message: `Error al guardar la ruta: ${msg}` }
  }
}

// ─── Delete a tourism route ────────────────────────────────────────────────
export async function deleteTourismRoute(id_ruta: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error: pointsError } = await supabase
      .from("puntos_de_ruta")
      .delete()
      .eq("id_ruta", id_ruta)

    if (pointsError) throw new Error(pointsError.message)

    const { error: routeError } = await supabase
      .from("rutas_turisticas")
      .delete()
      .eq("id_ruta", id_ruta)

    if (routeError) throw new Error(routeError.message)

    return { success: true, message: "Ruta eliminada correctamente." }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido"
    return { success: false, message: `Error al eliminar la ruta: ${msg}` }
  }
}

// ─── Load all routes ───────────────────────────────────────────
export async function loadAllRoutes(): Promise<SavedTourismRoute[]> {
  // Try fetching with destacada + activa columns; fall back without them if they don't exist yet
  const { data, error } = await supabase
    .from("rutas_turisticas")
    .select("id_ruta, nombre_ruta, distancia_total, nivel_dificultad, tiempo_estimado, nit_empresa, imagen_url, destacada, activa")
    .order("fecha_creacion", { ascending: false })

  if (!error && data) return data as SavedTourismRoute[]

  // Fallback: columns may not exist yet — fetch without them
  if (error && isSchemaColumnError(error.message)) {
    const { data: fallbackData } = await supabase
      .from("rutas_turisticas")
      .select("id_ruta, nombre_ruta, distancia_total, nivel_dificultad, tiempo_estimado, nit_empresa")
      .order("fecha_creacion", { ascending: false })
    return (fallbackData as SavedTourismRoute[]) ?? []
  }

  return []
}

// ─── Toggle ‘destacada’ for a route (optimistic, like products) ────────────────
export async function toggleDestacadaRoute(
  id_ruta: string,
  newValue: boolean
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from("rutas_turisticas")
    .update({ destacada: newValue })
    .eq("id_ruta", id_ruta)
  return { success: !error }
}

// ─── Toggle ‘activa’ (visible in public section) for a route ──────────────
export async function toggleActivaRoute(
  id_ruta: string,
  newValue: boolean
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from("rutas_turisticas")
    .update({ activa: newValue })
    .eq("id_ruta", id_ruta)
  return { success: !error }
}

// ─── Load empresas for the NIT selector ───────────────────────────────────
export type EmpresaOption = {
  id_empresa: string
  nombre_comercial: string
  nit: string
}

export async function loadEmpresas(): Promise<EmpresaOption[]> {
  const { data, error } = await supabase
    .from("empresas")
    .select("id_empresa, nombre_comercial, nit")
    .order("nombre_comercial")
  if (error || !data) return []
  return data as EmpresaOption[]
}
