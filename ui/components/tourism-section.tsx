"use client"

import { useEffect, useMemo, useState } from "react"
import { Compass, MapPin, Route } from "lucide-react"
import { cn } from "@/ui/utils"
import {
  getTourismRoutePoints,
  type TouristRouteDto,
} from "@/controller/tourim_controller"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1553531889-56cc480ac5cb?auto=format&fit=crop&w=1200&q=80"

export function TourismSection() {
  const [routes, setRoutes] = useState<TouristRouteDto[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState("")
  const [hoveredPointId, setHoveredPointId] = useState("")

  useEffect(() => {
    let active = true

    async function loadRoutes() {
      const data = await getTourismRoutePoints()
      if (!active || data.length === 0) return

      setRoutes(data)
      const firstRoute = data[0]
      setSelectedRouteId(firstRoute.id)
      setHoveredPointId(firstRoute.points[0]?.id ?? "")
    }

    void loadRoutes()

    return () => {
      active = false
    }
  }, [])

  const selectedRoute = useMemo(() => {
    if (routes.length === 0) return null
    return routes.find((route) => route.id === selectedRouteId) ?? routes[0]
  }, [routes, selectedRouteId])

  const orderedPoints = selectedRoute?.points ?? []

  const activePoint =
    orderedPoints.find((point) => point.id === hoveredPointId) ??
    orderedPoints[0]

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
            Recorridos turisticos
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Explora rutas y sus puntos geograficos segun el orden definido.
          </p>
        </div>

        {routes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No hay rutas turisticas disponibles.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-1">
              {routes.map((routeItem) => (
                <button
                  key={routeItem.id}
                  onClick={() => {
                    setSelectedRouteId(routeItem.id)
                    setHoveredPointId(routeItem.points[0]?.id ?? "")
                  }}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-colors",
                    selectedRoute?.id === routeItem.id
                      ? "border-forest bg-forest/10"
                      : "border-border hover:border-forest/40"
                  )}
                >
                  <h3 className="font-semibold text-foreground">{routeItem.name}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {routeItem.duration}  {routeItem.distanceKm} km  dificultad{" "}
                    {routeItem.difficulty.toLowerCase()}
                  </p>
                </button>
              ))}
            </div>

            {selectedRoute && (
              <div className="rounded-3xl border border-border bg-card p-4 lg:col-span-2">
                <div className="mb-4 flex items-center gap-2 text-foreground">
                  <Route size={18} className="text-forest" />
                  <h3 className="font-semibold">{selectedRoute.name}</h3>
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
                        key={point.id}
                        type="button"
                        onMouseEnter={() => setHoveredPointId(point.id)}
                        onFocus={() => setHoveredPointId(point.id)}
                        className={cn(
                          "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-forest text-white shadow-lg transition-all",
                          hoveredPointId === point.id ? "h-8 w-8 scale-110" : "h-6 w-6"
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
                      <img
                        src={activePoint.image ?? FALLBACK_IMAGE}
                        alt={activePoint.name}
                        className="h-52 w-full object-cover"
                      />
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-forest">
                        <MapPin size={14} />
                        Punto activo
                      </p>

                      <span className="inline-block rounded-full bg-forest/10 px-2 py-1 text-xs text-forest">
                        {activePoint.type}
                      </span>

                      <h4 className="mt-3 text-xl font-semibold text-foreground">
                        {activePoint.name}
                      </h4>

                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {activePoint.description ?? "Sin descripciï¿½n disponible."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

