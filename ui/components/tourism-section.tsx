"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Clock, Compass, MapPin, Route, Star, X } from "lucide-react"
import { cn } from "@/ui/utils"
import {
  getTourismRoutePoints,
  type TouristRouteDto,
  type RoutePointDto,
} from "@/controller/tourim_controller"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1553531889-56cc480ac5cb?auto=format&fit=crop&w=1200&q=80"

// Lazy-load Leaflet only on client
const TourismRouteMap = dynamic(
  () => import("@/ui/components/tourism-route-map").then((m) => m.TourismRouteMap),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Cargando mapa...</div> }
)

const formatDistance = (distance: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(distance)

const DIFFICULTY_COLOR: Record<string, string> = {
  bajo: "bg-green-500/15 text-green-400 border-green-500/30",
  medio: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  alto: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  extremo: "bg-red-500/15 text-red-400 border-red-500/30",
}

function difficultyClass(level: string) {
  return DIFFICULTY_COLOR[level.toLowerCase()] ?? "bg-muted text-muted-foreground border-border"
}

export function TourismSection() {
  const [routes, setRoutes] = useState<TouristRouteDto[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState("")
  const [activePointId, setActivePointId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    let active = true
    async function load() {
      const data = await getTourismRoutePoints()
      if (!active) return
      setRoutes(data)
      setIsLoading(false)
    }
    void load()

    const handleRouteSaved = () => {
      void load()
    }
    window.addEventListener("route-saved", handleRouteSaved)

    return () => {
      active = false
      window.removeEventListener("route-saved", handleRouteSaved)
    }
  }, [])

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id_ruta === selectedRouteId) ?? null,
    [routes, selectedRouteId]
  )

  const orderedPoints = selectedRoute?.points ?? []

  const activePoint: RoutePointDto | undefined =
    orderedPoints.find((p) => p.id_punto === activePointId) ?? orderedPoints[0]

  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selectedRoute ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [selectedRoute])

  const openRoute = (route: TouristRouteDto) => {
    setSelectedRouteId(route.id_ruta)
    setActivePointId(route.points[0]?.id_punto ?? "")
    setActiveImageIndex(0)
  }

  const closeRoute = () => {
    setSelectedRouteId("")
    setActivePointId("")
  }

  return (
    <section id="turismo" className="bg-background py-14 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-forest/50 px-4 py-2">
            <Compass size={16} />
            <span className="text-sm font-medium uppercase tracking-wider">Turismo</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl lg:text-5xl">
            Recorridos turísticos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Elige una ruta para explorar sus puntos geográficos, dificultad y tiempo estimado.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-forest border-t-transparent" />
            <p className="text-sm text-muted-foreground">Cargando rutas turísticas...</p>
          </div>
        ) : routes.filter((r) => r.activa !== false).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            No hay rutas turísticas disponibles por el momento.
          </div>
        ) : (
          <>
            {/* Cards grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {routes.filter((r) => r.activa !== false).map((routeItem) => {
                const isSelected = selectedRoute?.id_ruta === routeItem.id_ruta
                return (
                  <button
                    key={routeItem.id_ruta}
                    type="button"
                    onClick={() => openRoute(routeItem)}
                    aria-expanded={isSelected}
                    className={cn(
                      "group relative flex min-h-48 w-full flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition-all duration-300",
                      isSelected
                        ? "border-forest bg-forest/10 shadow-lg shadow-forest/10"
                        : routeItem.destacada
                        ? "border-amber-400/70 shadow-[0_0_20px_rgba(251,191,36,0.12)] hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(251,191,36,0.2)]"
                        : "border-border hover:-translate-y-1 hover:border-forest/50 hover:shadow-lg"
                    )}
                  >
                    {/* Subtle background accent */}
                    <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-forest/5 blur-2xl transition-all group-hover:bg-forest/10" />

                    {/* Destacada badge */}
                    {routeItem.destacada && (
                      <div className="absolute left-3 top-3 z-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 shadow-md animate-in zoom-in-50 duration-300">
                        <Star size={13} fill="currentColor" className="text-neutral-900" />
                      </div>
                    )}

                    <div className="relative">
                      <div className={cn(
                        "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest transition-transform group-hover:scale-110",
                        routeItem.destacada ? "ml-7" : ""
                      )}>
                        <Route size={24} />
                      </div>

                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {routeItem.nombre_ruta}
                      </h3>

                      {(routeItem.nombre_empresa ?? routeItem.id_empresa) && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {routeItem.nombre_empresa ?? routeItem.id_empresa}
                        </p>
                      )}

                      {/* Star rating */}
                      <div className="mt-2 flex items-center gap-1">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="text-sm text-muted-foreground">
                          {routeItem.calificacion ?? 5}
                        </span>
                      </div>
                    </div>

                    <div className="relative mt-4 flex flex-wrap gap-2">
                      <span className={cn(
                        "rounded-full border px-3 py-1 text-sm font-semibold",
                        difficultyClass(routeItem.nivel_dificultad)
                      )}>
                        {routeItem.nivel_dificultad}
                      </span>
                      {routeItem.tiempo_estimado && (
                        <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                          <Clock size={11} />
                          {routeItem.tiempo_estimado}
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        {formatDistance(routeItem.distancia_total)} km
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        {routeItem.points.length} punto{routeItem.points.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Arrow hint */}
                    <div className="pointer-events-none absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Placeholder when nothing selected */}
            {!selectedRoute && (
              <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-center text-sm text-muted-foreground sm:p-6">
                Selecciona una tarjeta para ver el mapa interactivo y la información completa de la ruta.
              </div>
            )}

            {/* MODAL */}
            {selectedRoute && (
              <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-6">
                {/* Backdrop */}
                <button
                  type="button"
                  aria-label="Cerrar ventana de ruta"
                  className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={closeRoute}
                />

                {/* Panel */}
                <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={closeRoute}
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground transition hover:bg-background"
                    aria-label="Cerrar"
                  >
                    <X size={18} />
                  </button>

                  <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside className="border-b border-border bg-background/60 p-5 lg:border-b-0 lg:border-r">
                      {/* Route info */}
                      <div className="mb-5 rounded-xl border border-border bg-card p-4">
                        <p className="text-sm font-semibold uppercase tracking-widest text-forest">Ruta seleccionada</p>
                        <h3 className="mt-1.5 text-lg font-bold text-foreground leading-snug">{selectedRoute.nombre_ruta}</h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={cn("rounded-full border px-2.5 py-0.5 text-sm font-semibold", difficultyClass(selectedRoute.nivel_dificultad))}>
                            {selectedRoute.nivel_dificultad}
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {selectedRoute.tiempo_estimado && (
                            <p className="flex items-center gap-2">
                              <Clock size={13} className="shrink-0 text-forest" />
                              {selectedRoute.tiempo_estimado}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Route size={13} className="shrink-0 text-forest" />
                            {formatDistance(selectedRoute.distancia_total)} km
                          </p>
                          {(selectedRoute.nombre_empresa ?? selectedRoute.id_empresa) && (
                            <p className="flex items-center gap-2">
                              <MapPin size={13} className="shrink-0 text-forest" />
                              {selectedRoute.nombre_empresa ?? selectedRoute.id_empresa}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Points list */}
                      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Puntos del recorrido</p>
                      <div className="space-y-2">
                        {orderedPoints.map((point, index) => (
                          <button
                            key={point.id_ruta_punto ?? point.id_punto}
                            type="button"
                            onClick={() => setActivePointId(point.id_punto)}
                            className={cn(
                              "w-full rounded-xl border p-3 text-left transition-all",
                              activePoint?.id_punto === point.id_punto
                                ? "border-forest bg-forest/10"
                                : "border-border hover:border-forest/40 hover:bg-card"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={cn(
                                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                                index === 0
                                  ? "bg-green-500 text-white"
                                  : index === orderedPoints.length - 1
                                  ? "bg-red-500 text-white"
                                  : "bg-forest/20 text-forest"
                              )}>
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-base font-medium text-foreground">{point.nombre_lugar}</p>
                                <p className="text-sm text-muted-foreground">{point.tipo_punto}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </aside>

                    {/* Main content */}
                    <div className="flex flex-col gap-0">
                      {/* Leaflet map */}
                      <div className="h-[320px] w-full lg:h-[380px]">
                        <TourismRouteMap
                          points={orderedPoints}
                          activePointId={activePointId}
                          onPointSelect={setActivePointId}
                        />
                      </div>

                      {/* Active point detail */}
                      {activePoint && (
                        <div className="grid gap-0 sm:grid-cols-2">
                          {/* Image */}
                          {/* Image slider for Route, fallback to point image */}
                          <div className="relative h-52 overflow-hidden bg-muted sm:h-60">
                            {selectedRoute.images && selectedRoute.images.length > 0 ? (
                              <>
                                <img
                                  src={selectedRoute.images[activeImageIndex]}
                                  alt={selectedRoute.nombre_ruta}
                                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                {selectedRoute.images.length > 1 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveImageIndex((prev) => (prev === 0 ? selectedRoute.images!.length - 1 : prev - 1))
                                      }}
                                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-forest shadow-md"
                                      aria-label="Imagen anterior"
                                    >
                                      ‹
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveImageIndex((prev) => (prev === selectedRoute.images!.length - 1 ? 0 : prev + 1))
                                      }}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-forest shadow-md"
                                      aria-label="Siguiente imagen"
                                    >
                                      ›
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                                      {selectedRoute.images.map((_, idx) => (
                                        <span
                                          key={idx}
                                          className={cn(
                                            "h-1.5 w-1.5 rounded-full transition-all",
                                            idx === activeImageIndex ? "bg-white w-3" : "bg-white/50"
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </>
                                )}
                              </>
                            ) : (
                              <img
                                src={activePoint.image ?? FALLBACK_IMAGE}
                                alt={activePoint.nombre_lugar}
                                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex flex-col justify-center gap-3 p-5">
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-sm font-semibold text-forest">
                              <MapPin size={12} />
                              {activePoint.tipo_punto}
                            </span>

                            <h4 className="text-2xl font-bold text-foreground">{activePoint.nombre_lugar}</h4>

                            <p className="text-base leading-relaxed text-muted-foreground">
                              {activePoint.description ?? "Sin descripción disponible para este punto."}
                            </p>

                            <p className="text-sm text-muted-foreground/70">
                              📍 {activePoint.latitud.toFixed(5)}, {activePoint.longitud.toFixed(5)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
