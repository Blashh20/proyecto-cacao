"use client"

import { useEffect } from "react"
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"

export type RouteMapPoint = {
  lat: number
  lng: number
  label: string // "A" | "B"
}

const MAP_CENTER: [number, number] = [10.75, -73.75]
const MAP_ZOOM = 9

function MapSizeFixer() {
  const map = useMap()
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize({ pan: false, animate: false }), 50)
    return () => window.clearTimeout(id)
  }, [map])
  return null
}

function createPointIcon(label: "A" | "B", isActive: boolean) {
  const bg = label === "A" ? "#22c55e" : "#ef4444"
  const shadow = label === "A" ? "#16a34a" : "#dc2626"
  const size = isActive ? 44 : 36

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${bg};
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 12px ${shadow}88;
        display:flex;align-items:center;justify-content:center;
        font-weight:700;font-size:${size * 0.38}px;color:white;
        font-family:system-ui,sans-serif;
        transition:all 0.2s;
        transform:${isActive ? "scale(1.15)" : "scale(1)"};
      ">
        ${label}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function MapClickHandler({
  onClick,
  mode,
}: {
  onClick: (lat: number, lng: number) => void
  mode: "A" | "B" | null
}) {
  useMapEvents({
    click(e) {
      if (mode) onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function TourismAdminMapLeaflet({
  pointA,
  pointB,
  selectMode,
  onMapClick,
}: {
  pointA: { lat: number; lng: number } | null
  pointB: { lat: number; lng: number } | null
  selectMode: "A" | "B" | null
  onMapClick: (lat: number, lng: number) => void
}) {
  const routeLine: [number, number][] = []
  if (pointA) routeLine.push([pointA.lat, pointA.lng])
  if (pointB) routeLine.push([pointB.lat, pointB.lng])

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="z-0 h-[380px] w-full rounded-2xl"
      scrollWheelZoom
      style={{
        background: "#1a2e1a",
        cursor: selectMode ? "crosshair" : "grab",
      }}
    >
      <MapSizeFixer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={onMapClick} mode={selectMode} />

      {routeLine.length === 2 && (
        <Polyline
          positions={routeLine}
          pathOptions={{ color: "#22c55e", weight: 4, dashArray: "10 6", opacity: 0.85 }}
        />
      )}

      {pointA && (
        <Marker
          position={[pointA.lat, pointA.lng]}
          icon={createPointIcon("A", selectMode === "A")}
        />
      )}

      {pointB && (
        <Marker
          position={[pointB.lat, pointB.lng]}
          icon={createPointIcon("B", selectMode === "B")}
        />
      )}
    </MapContainer>
  )
}
