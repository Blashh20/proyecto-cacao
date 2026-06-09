"use client"

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"
import L from "leaflet"


import type { Project } from "@/model/projects"

const MAP_CENTER: [number, number] = [10.75, -73.75]
const MAP_ZOOM = 9

// components/tourism-map.tsx
import { AdminMapLeaflet as MapBase } from "./admin-map-leaflet";

export function TourismMap({ points, activePointId, onPointSelect, onMapClick }: any) {

  // Transformamos tus puntos de turismo al tipo 'Project' que espera el mapa
  const projectsAsProjects: Project[] = points.map((p: any) => ({
    id: Number(p.id_punto),
    name: p.nombre_lugar,
    coordinates: {
      lat: Number(p.latitud),
      lng: Number(p.longitud)
    },
    // Asegúrate de incluir cualquier otro campo requerido por tu interfaz Project
    // Si la interfaz exige otros campos (como 'description' o 'status'), agrégalos aquí.
  } as Project)); // Forzamos el tipo para asegurar compatibilidad

  return (
    <MapBase // Usamos el alias importado
      projects={projectsAsProjects}
      selectedProjectId={activePointId}
      onProjectSelect={(project: Project) => onPointSelect(project.id)}
      onMapClick={onMapClick}
      newPointCoordinates={null}
    />
  );
}
function createCustomIcon(isSelected: boolean) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative">
        <div class="${isSelected ? "w-10 h-10" : "w-8 h-8"} bg-forest rounded-full border-4 border-white shadow-lg flex items-center justify-center transition-all duration-300 ${isSelected ? "scale-125 bg-forest-dark" : ""}">
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? "20" : "16"}" height="${isSelected ? "20" : "16"}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        ${isSelected ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 bg-forest-dark -z-10"></div>' : ""}
      </div>
    `,
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32],
  })
}

// Marker for the new point the admin is adding
function createNewPointIcon() {
  return L.divIcon({
    className: "custom-marker new-point",
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-amber-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 bg-amber-500 -z-10"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}



export function AdminMapLeaflet({
  projects,
  selectedProjectId,
  onProjectSelect,
  onMapClick,
  newPointCoordinates,
}: {
  projects: Project[]
  selectedProjectId: number | null
  onProjectSelect: (project: Project) => void
  onMapClick: (lat: number, lng: number) => void
  newPointCoordinates: { lat: number; lng: number } | null
}) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      className="z-0 h-[300px] w-full rounded-2xl sm:h-[360px] lg:h-[400px]"
      scrollWheelZoom
      style={{ background: "#1a2e1a" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={onMapClick} />

      {projects.map((project) => (
        <Marker
          key={project.id}
          position={[project.coordinates.lat, project.coordinates.lng]}
          icon={createCustomIcon(selectedProjectId === project.id)}
          eventHandlers={{ click: () => onProjectSelect(project) }}
        />
      ))}

      {newPointCoordinates && !selectedProjectId && (
        <Marker
          position={[newPointCoordinates.lat, newPointCoordinates.lng]}
          icon={createNewPointIcon()}
        />
      )}
    </MapContainer>
  )
}

