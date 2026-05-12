"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  fetchDashboardRegiones,
  fetchFincas,
  fetchAsistencias,
  fetchConservacion,
  fetchVentas,
  type FincaRow,
  type AsistenciaRow,
  type ConservacionRow,
  type VentaRow,
} from "@/controller/dashboard-service"

export interface MonitoreoMetrics {
  fincasCertificadasUE: number
  hectareasGestionadas: number
  asistenciasTecnicas: number
  serviciosPorTipo: { tipo: string; count: number }[]
  fincasPorRegion: { region: string; count: number }[]
}

export interface ImpactoMetrics {
  totalConservadas: number
  avgSalud: number
  distribucionFinca: { name: string; value: number }[]
  regeneracionFinca: { finca: string; indice: number }[]
}

export interface VentasMetrics {
  totalIngresos: number
  totalUtilidad: number
  porProducto: { name: string; size: number }[]
  ventasPorDia: Record<string, number>[]
  productosUnicos: string[]
}

export function useDashboardController() {
  const [regiones, setRegiones] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState("")
  const [fincas, setFincas] = useState<FincaRow[]>([])
  const [asistencias, setAsistencias] = useState<AsistenciaRow[]>([])
  const [conservacion, setConservacion] = useState<ConservacionRow[]>([])
  const [ventas, setVentas] = useState<VentaRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void fetchDashboardRegiones().then(setRegiones)
  }, [])

  const loadData = useCallback(async (region: string) => {
    setIsLoading(true)
    const [f, a, c, v] = await Promise.all([
      fetchFincas(region || undefined),
      fetchAsistencias(region || undefined),
      fetchConservacion(region || undefined),
      fetchVentas(region || undefined),
    ])
    setFincas(f)
    setAsistencias(a)
    setConservacion(c)
    setVentas(v)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void loadData(selectedRegion)
  }, [selectedRegion, loadData])

  const monitoreoMetrics = useMemo<MonitoreoMetrics>(() => {
    const serviciosMap: Record<string, number> = {}
    for (const a of asistencias) {
      serviciosMap[a.tipo_servicio] = (serviciosMap[a.tipo_servicio] ?? 0) + 1
    }
    const regionMap: Record<string, number> = {}
    for (const f of fincas) {
      regionMap[f.nombre_region] = (regionMap[f.nombre_region] ?? 0) + 1
    }
    return {
      fincasCertificadasUE: fincas.filter((f) => f.certificada_ue).length,
      hectareasGestionadas: fincas.reduce((s, f) => s + (f.hectareas ?? 0), 0),
      asistenciasTecnicas: asistencias.length,
      serviciosPorTipo: Object.entries(serviciosMap).map(([tipo, count]) => ({ tipo, count })),
      fincasPorRegion: Object.entries(regionMap).map(([region, count]) => ({ region, count })),
    }
  }, [fincas, asistencias])

  const impactoMetrics = useMemo<ImpactoMetrics>(() => {
    const total = conservacion.reduce((s, c) => s + (c.hectareas_conservadas ?? 0), 0)
    const avg =
      conservacion.length > 0
        ? conservacion.reduce((s, c) => s + (c.indice_salud_ecologica ?? 0), 0) / conservacion.length
        : 0
    return {
      totalConservadas: total,
      avgSalud: avg,
      distribucionFinca: conservacion.map((c) => ({
        name: c.nombre_finca,
        value: c.hectareas_conservadas ?? 0,
      })),
      regeneracionFinca: conservacion.map((c) => ({
        finca: c.nombre_finca,
        indice: c.indice_regeneracion ?? 0,
      })),
    }
  }, [conservacion])

  const ventasMetrics = useMemo<VentasMetrics>(() => {
    const totalIngresos = ventas.reduce((s, v) => s + (v.monto_total ?? 0), 0)
    const totalUtilidad = ventas.reduce((s, v) => s + (v.utilidad ?? 0), 0)

    const productoMap: Record<string, number> = {}
    for (const v of ventas) {
      productoMap[v.nombre_producto] = (productoMap[v.nombre_producto] ?? 0) + (v.monto_total ?? 0)
    }
    const porProducto = Object.entries(productoMap).map(([name, size]) => ({ name, size }))

    const diaMap: Record<string, Record<string, number>> = {}
    for (const v of ventas) {
      const key = String(v.dia)
      if (!diaMap[key]) diaMap[key] = { dia: v.dia }
      diaMap[key][v.nombre_producto] = ((diaMap[key][v.nombre_producto] ?? 0) as number) + (v.monto_total ?? 0)
    }

    const productosUnicos = [...new Set(ventas.map((v) => v.nombre_producto))]
    const ventasPorDia = Object.values(diaMap).sort(
      (a, b) => (a.dia as number) - (b.dia as number)
    )

    return { totalIngresos, totalUtilidad, porProducto, ventasPorDia, productosUnicos }
  }, [ventas])

  return {
    regiones,
    selectedRegion,
    setSelectedRegion,
    isLoading,
    monitoreoMetrics,
    impactoMetrics,
    ventasMetrics,
  }
}
