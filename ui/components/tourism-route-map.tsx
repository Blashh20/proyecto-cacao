"use client"

import { useEffect } from "react"
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import type { RoutePointDto } from "@/controller/tourim_controller"

const MAP_FALLBACK_CENTER: [number, number] = [10.75, -73.75]

function MapSizeFixer() {
  const map = useMap()
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize({ pan: false, animate: false }), 80)
    return () => window.clearTimeout(id)
  }, [map])
  return null
}

function MapFitter({ points }: { points: RoutePointDto[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    const validPoints = points.filter((p) => p.latitud !== 0 || p.longitud !== 0)
    if (validPoints.length === 0) return

    const bounds = L.latLngBounds(validPoints.map((p) => [p.latitud, p.longitud] as [number, number]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [map, points])

  return null
}

function createPointMarker(index: number, total: number, isActive: boolean) {
  const isFirst = index === 0
  const isLast = index === total - 1

  const bg = isFirst ? "#22c55e" : isLast ? "#ef4444" : isActive ? "#16a34a" : "#166534"
  const size = isActive ? 42 : 34
  const label = isFirst ? "A" : isLast ? "B" : String(index + 1)

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${bg};
        border:3px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-weight:700;font-size:${size * 0.38}px;color:white;
        font-family:system-ui,sans-serif;
        box-shadow:0 3px 14px rgba(0,0,0,0.4);
        transition:all .2s;
        transform:${isActive ? "scale(1.2)" : "scale(1)"};
      ">
        ${label}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function TourismRouteMap({
  points,
  activePointId,
  onPointSelect,
}: {
  points: RoutePointDto[]
  activePointId: string
  onPointSelect: (id: string) => void
}) {
  const validPoints = points.filter((p) => p.latitud !== 0 || p.longitud !== 0)
  const center: [number, number] =
    validPoints.length > 0
      ? [validPoints[0].latitud, validPoints[0].longitud]
      : MAP_FALLBACK_CENTER

  const polylineCoords: [number, number][] = validPoints.map((p) => [p.latitud, p.longitud])

  return (
    <MapContainer
      center={center}
      zoom={10}
      className="z-0 h-full w-full"
      scrollWheelZoom
      style={{ background: "#1a2e1a" }}
    >
      <MapSizeFixer />
      <MapFitter points={validPoints} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {polylineCoords.length >= 2 && (
        <>
          {/* Shadow line */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: "#ffffff", weight: 7, opacity: 0.3, lineCap: "round" }}
          />
          {/* Main dashed line */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: "#22c55e",
              weight: 3.5,
              dashArray: "10 7",
              opacity: 0.9,
              lineCap: "round",
            }}
          />
        </>
      )}

      {validPoints.map((point, index) => (
        <Marker
          key={point.id_punto}
          position={[point.latitud, point.longitud]}
          icon={createPointMarker(index, validPoints.length, point.id_punto === activePointId)}
          eventHandlers={{ click: () => onPointSelect(point.id_punto) }}
        />
      ))}
    </MapContainer>
  )
}
