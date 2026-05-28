"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Compass, MapPin, Route } from "lucide-react"
import { cn } from "@/ui/utils"
import {
  getTourismRoutePoints,
  type TouristRouteDto,
} from "@/controller/tourim_controller"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1553531889-56cc480ac5cb?auto=format&fit=crop&w=1200&q=80"

const formatDistance = (distance: number) =>
  new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
  }).format(distance)

export function TourismSection() {
  const [routes, setRoutes] = useState<TouristRouteDto[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState("")
  const [hoveredPointId, setHoveredPointId] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadRoutes() {
      const data = await getTourismRoutePoints()
      if (!active) return

      setRoutes(data)
      setIsLoading(false)
    }

    void loadRoutes()

    return () => {
      active = false
    }
  }, [])

  const selectedRoute = useMemo(() => {
    if (!selectedRouteId) return null
    return routes.find((route) => route.id_ruta === selectedRouteId) ?? null
  }, [routes, selectedRouteId])

  const orderedPoints = selectedRoute?.points ?? []

  const activePoint =
    orderedPoints.find((point) => point.id_punto === hoveredPointId) ??
    orderedPoints[0]

  const openRoute = (route: TouristRouteDto) => {
    setSelectedRouteId(route.id_ruta)
    setHoveredPointId(route.points[0]?.id_punto ?? "")
  }

  return (
    <section id="turismo" className="bg-background py-24">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
            <Compass size={16} />
            <span className="text-sm font-medium uppercase tracking-wider">
              Turismo
            </span>
          </div>

          <h2 className="text-4xl font-serif font-bold text-foreground md:text-5xl">
            Recorridos turísticos
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Elige una ruta turística para abrir su información, dificultad y puntos GPS.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Cargando rutas turísticas...
          </div>
        ) : routes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No hay rutas turísticas disponibles.
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {routes.map((routeItem) => {
                const isSelected = selectedRoute?.id_ruta === routeItem.id_ruta

                return (
                  <button
                    key={routeItem.id_ruta}
                    type="button"
                    onClick={() => openRoute(routeItem)}
                    aria-expanded={isSelected}
                    className={cn(
                      "group flex min-h-56 w-full flex-col justify-between rounded-3xl border bg-card p-6 text-left shadow-sm transition-all",
                      isSelected
                        ? "border-forest bg-forest/10 shadow-lg"
                        : "border-border hover:-translate-y-1 hover:border-forest/50 hover:shadow-md"
                    )}
                  >
                    <div>
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest transition-transform group-hover:scale-105">
                        <Route size={22} />
                      </div>

                      <h3 className="text-xl font-semibold text-foreground">
                        {routeItem.nombre_ruta}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Haz click para ver el recorrido, sus puntos geográficos y la información de navegación.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-forest/10 px-3 py-1 font-medium text-forest">
                        {routeItem.nivel_dificultad}
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                        {routeItem.tiempo_estimado || "Sin tiempo"}
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                        {formatDistance(routeItem.distancia_total)} km
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                        {routeItem.points.length} puntos
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {!selectedRoute ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
                Selecciona una tarjeta para abrir la información completa de la ruta.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-3 lg:col-span-1">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wide text-forest">
                      Ruta seleccionada
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">
                      {selectedRoute.nombre_ruta}
                    </h3>
                    <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                      <p>Dificultad: {selectedRoute.nivel_dificultad}</p>
                      <p>Duración: {selectedRoute.tiempo_estimado || "Sin tiempo estimado"}</p>
                      <p>Distancia: {formatDistance(selectedRoute.distancia_total)} km</p>
                      {selectedRoute.id_empresa && <p>Empresa: {selectedRoute.id_empresa}</p>}
                    </div>
                  </div>

                  {orderedPoints.map((point, index) => (
                    <button
                      key={point.id_ruta_punto ?? point.id_punto}
                      type="button"
                      onClick={() => setHoveredPointId(point.id_punto)}
                      className={cn(
                        "w-full rounded-xl border bg-card p-3 text-left transition-colors",
                        activePoint?.id_punto === point.id_punto
                          ? "border-forest bg-forest/10"
                          : "border-border hover:border-forest/40"
                      )}
                    >
                      <p className="text-xs uppercase tracking-wide text-forest">
                        Punto {index + 1}
                      </p>
                      <p className="font-medium text-foreground">{point.nombre_lugar}</p>
                      <p className="text-xs text-muted-foreground">{point.tipo_punto}</p>
                    </button>
                  ))}
                </div>

                <div className="rounded-3xl border border-border bg-card p-4 lg:col-span-2">
                  <div className="mb-4 flex items-center gap-2 text-foreground">
                    <Route size={18} className="text-forest" />
                    <h3 className="font-semibold">{selectedRoute.nombre_ruta}</h3>
                  </div>

                  <div className="relative h-[300px] rounded-2xl bg-gradient-to-br from-forest/10 via-forest/5 to-background">
                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={orderedPoints
                          .map((point, index, list) => {
                            const x = list.length > 1 ? (index / (list.length - 1)) * 90 + 5 : 50
                            const y = 50 + Math.sin(index * 1.2) * 20
                            return `${x},${y}`
                          })
                          .join(" ")}
                        fill="none"
                        stroke="hsl(var(--forest))"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeDasharray="4 2"
                      />
                    </svg>

                    {orderedPoints.map((point, index, list) => {
                      const x = list.length > 1 ? (index / (list.length - 1)) * 90 + 5 : 50
                      const y = 50 + Math.sin(index * 1.2) * 20

                      return (
                        <button
                          key={point.id_ruta_punto ?? point.id_punto}
                          type="button"
                          onMouseEnter={() => setHoveredPointId(point.id_punto)}
                          onFocus={() => setHoveredPointId(point.id_punto)}
                          className={cn(
                            "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-forest text-white shadow-lg transition-all",
                            activePoint?.id_punto === point.id_punto ? "h-8 w-8 scale-110" : "h-6 w-6"
                          )}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                        >
                          <span className="text-[10px] font-bold">{index + 1}</span>
                        </button>
                      )
                    })}
                  </div>

                  {activePoint && (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="overflow-hidden rounded-2xl border border-border">
                        <Image
                          src={activePoint.image ?? FALLBACK_IMAGE}
                          alt={activePoint.nombre_lugar}
                          width={800}
                          height={416}
                          className="h-52 w-full object-cover"
                        />
                      </div>

                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-forest">
                          <MapPin size={14} />
                          Punto activo
                        </p>

                        <span className="inline-block rounded-full bg-forest/10 px-2 py-1 text-xs text-forest">
                          {activePoint.tipo_punto}
                        </span>

                        <h4 className="mt-3 text-xl font-semibold text-foreground">
                          {activePoint.nombre_lugar}
                        </h4>

                        <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                          <p>{activePoint.description ?? "Sin descripción disponible."}</p>
                          <p>
                            Coordenadas: {activePoint.latitud}, {activePoint.longitud}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
