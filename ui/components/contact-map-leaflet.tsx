"use client"

import { useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from "leaflet"
import { useMap } from "react-leaflet/hooks"

const UPC_COORDS: [number, number] = [10.4533, -73.2568]
const MAP_ZOOM = 16

function MapSizeFixer() {
  const map = useMap()

  useEffect(() => {
    let rafId: number | null = null

    const refreshMapSize = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        map.invalidateSize({ pan: false, animate: false })
        rafId = null
      })
    }

    const timeoutId = window.setTimeout(refreshMapSize, 0)
    window.addEventListener("resize", refreshMapSize, { passive: true })

    return () => {
      window.clearTimeout(timeoutId)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      window.removeEventListener("resize", refreshMapSize)
    }
  }, [map])

  return null
}

function createCustomIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-forest rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 bg-forest -z-10"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })
}

export function ContactMapLeaflet() {
  return (
    <MapContainer
      center={UPC_COORDS}
      zoom={MAP_ZOOM}
      className="z-0 h-full w-full rounded-xl"
      scrollWheelZoom={false}
      touchZoom
      doubleClickZoom
      boxZoom
      keyboard
      style={{ background: "#1a2e1a" }}
    >
      <MapSizeFixer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={UPC_COORDS} icon={createCustomIcon()}>
        <Popup className="custom-popup">
          <div className="min-w-[150px] rounded-xl bg-card p-4 text-center shadow-xl ring-1 ring-border">
            <h4 className="mb-1 text-base font-bold text-foreground">Makakaw - Sede</h4>
            <p className="text-sm text-muted-foreground">Universidad Popular del Cesar</p>
            <p className="mt-1 text-xs text-muted-foreground">Valledupar, Colombia</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}
