"use client"

import { useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import L from "leaflet"
import { Leaf, Users } from "lucide-react"
import { useMap } from "react-leaflet/hooks"

import type { Project } from "@/model/projects"

const MAP_CENTER: [number, number] = [10.75, -73.75]
const MAP_ZOOM = 9

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

function createCustomIcon(isHovered: boolean) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="${isHovered ? "w-10 h-10" : "w-8 h-8"} bg-forest rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 ${isHovered ? "scale-125" : ""}">
          <svg xmlns="http://www.w3.org/2000/svg" width="${isHovered ? "20" : "16"}" height="${isHovered ? "20" : "16"}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        ${isHovered ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 bg-forest -z-10"></div>' : ""}
      </div>
    `,
    iconSize: isHovered ? [40, 40] : [32, 32],
    iconAnchor: isHovered ? [20, 40] : [16, 32],
  })
}

export function ProjectsMapLeaflet({
  projects,
  onProjectClick,
  hoveredProject,
}: {
  projects: Project[]
  onProjectClick: (project: Project) => void
  hoveredProject: number | null
}) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="z-0 h-[500px] w-full rounded-2xl"
      scrollWheelZoom={false}
      style={{ background: "#1a2e1a" }}
    >
      <MapSizeFixer />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {projects.map((project) => (
        <Marker
          key={project.id}
          position={[project.coordinates.lat, project.coordinates.lng]}
          icon={createCustomIcon(hoveredProject === project.id)}
          eventHandlers={{ click: () => onProjectClick(project) }}
        >
          <Popup className="custom-popup">
            <div className="min-w-[200px] p-2">
              <h4 className="mb-1 text-base font-bold text-foreground">{project.name}</h4>
              <p className="mb-2 text-sm text-muted-foreground">{project.location}</p>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Leaf size={12} className="text-forest" />
                  {project.hectares} ha
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} className="text-forest" />
                  {project.families} familias
                </span>
              </div>
              <button
                onClick={() => onProjectClick(project)}
                className="mt-3 w-full rounded-lg bg-forest py-2 text-sm font-medium text-white transition-colors hover:bg-forest-dark"
              >
                Ver detalles
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}


