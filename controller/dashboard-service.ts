import { supabase } from "@/services/client"

export interface FincaRow {
  nombre_finca: string
  nombre_region: string
  hectareas: number
  certificada_ue: boolean
}

export interface AsistenciaRow {
  tipo_servicio: string
  nombre_finca: string
  nombre_region: string
}

export interface ConservacionRow {
  nombre_finca: string
  nombre_region: string
  hectareas_conservadas: number
  indice_salud_ecologica: number
  indice_regeneracion: number
}

export interface VentaRow {
  nombre_producto: string
  nombre_region: string
  monto_total: number
  utilidad: number
  dia: number
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export async function fetchDashboardRegiones(): Promise<string[]> {
  return safe(async () => {
    const { data } = await supabase
      .from("regiones")
      .select("nombre_region")
      .order("nombre_region")
    return (data ?? []).map((r: { nombre_region: string }) => r.nombre_region)
  }, [])
}

export async function fetchFincas(region?: string): Promise<FincaRow[]> {
  return safe(async () => {
    let q = supabase.from("fincas").select("nombre_finca, nombre_region, hectareas, certificada_ue")
    if (region) q = q.eq("nombre_region", region)
    const { data } = await q
    return (data ?? []) as FincaRow[]
  }, [])
}

export async function fetchAsistencias(region?: string): Promise<AsistenciaRow[]> {
  return safe(async () => {
    let q = supabase
      .from("asistencias_tecnicas")
      .select("tipo_servicio, nombre_finca, nombre_region")
    if (region) q = q.eq("nombre_region", region)
    const { data } = await q
    return (data ?? []) as AsistenciaRow[]
  }, [])
}

export async function fetchConservacion(region?: string): Promise<ConservacionRow[]> {
  return safe(async () => {
    let q = supabase
      .from("conservacion")
      .select(
        "nombre_finca, nombre_region, hectareas_conservadas, indice_salud_ecologica, indice_regeneracion"
      )
    if (region) q = q.eq("nombre_region", region)
    const { data } = await q
    return (data ?? []) as ConservacionRow[]
  }, [])
}

export async function fetchVentas(region?: string): Promise<VentaRow[]> {
  return safe(async () => {
    let q = supabase
      .from("ventas")
      .select("nombre_producto, nombre_region, monto_total, utilidad, dia")
    if (region) q = q.eq("nombre_region", region)
    const { data } = await q
    return (data ?? []) as VentaRow[]
  }, [])
}
