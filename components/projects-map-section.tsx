"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Calendar, Leaf, MapPin, Mountain, TreePine, TrendingUp, Users, X } from "lucide-react"

import { useProjects } from "@/components/projects/projects-provider"
import { cn } from "@/lib/utils"
import type { Project, ProjectGalleryImage } from "@/lib/projects"

const ProjectsMapLeaflet = dynamic(() => import("@/components/projects-map-leaflet").then((mod) => mod.ProjectsMapLeaflet), {
  ssr: false,
})

function MapComponent({
  projects,
  onProjectClick,
  hoveredProject,
}: {
  projects: Project[]
  onProjectClick: (project: Project) => void
  hoveredProject: number | null
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-2xl bg-forest/10">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-forest border-t-transparent" />
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <ProjectsMapLeaflet projects={projects} onProjectClick={onProjectClick} hoveredProject={hoveredProject} />
  )
}

export function ProjectsMapSection() {
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [hoveredProject, setHoveredProject] = useState<number | null>(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0)

  useEffect(() => {
    setSelectedGalleryImage(0)
  }, [selectedProject?.id])

  return (
    <section id="proyectos" className="relative overflow-hidden bg-card py-24">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full border border-forest" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full border border-forest" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
            <Mountain size={18} />
            <span className="text-sm font-medium uppercase tracking-wider">Territorios de origen</span>
          </div>
          <h2 className="mb-6 text-4xl font-serif font-bold text-foreground md:text-5xl">Proyectos y territorios</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Explora los proyectos que Makakaw articula junto a productores y aliados en cafe y cacao para fortalecer origen, calidad y desarrollo rural.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-5">
          <div className="order-2 space-y-3 lg:order-1 lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <TreePine className="text-forest" size={20} />
              Puntos de desarrollo
            </h3>

            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all duration-300",
                  selectedProject?.id === project.id
                    ? "border-forest bg-forest/10"
                    : hoveredProject === project.id
                      ? "border-forest/50 bg-forest/5"
                      : "border-border hover:border-forest/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      selectedProject?.id === project.id ? "bg-forest text-white" : "bg-forest/20 text-forest"
                    )}
                  >
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.location}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Leaf size={12} className="text-forest" />
                        {project.hectares} ha
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-forest" />
                        {project.families} familias
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-forest/5 to-forest/10 p-4">
              <div className="absolute left-8 top-8 z-[1000] rounded-lg border border-border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-foreground">Makakaw en Colombia</p>
                <p className="text-xs text-muted-foreground">Mapa interactivo de proyectos</p>
              </div>

              <MapComponent projects={projects} onProjectClick={setSelectedProject} hoveredProject={hoveredProject} />

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Haz clic en los marcadores verdes para ver la informacion de cada proyecto.
              </p>
            </div>
          </div>
        </div>

        {selectedProject && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
            <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              {getProjectGallery(selectedProject).length > 0 ? (
                <>
                  <div className="relative h-56 overflow-hidden sm:h-64">
                    <img
                      src={getProjectGallery(selectedProject)[selectedGalleryImage].src}
                      alt={getProjectGallery(selectedProject)[selectedGalleryImage].alt}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
                    >
                      <X size={20} />
                    </button>
                    <div className="absolute bottom-4 left-4 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                      {selectedProject.coordinates.lat.toFixed(4)}N, {Math.abs(selectedProject.coordinates.lng).toFixed(4)}W
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-b border-border bg-background/40 p-4 sm:grid-cols-4">
                    {getProjectGallery(selectedProject).map((image, index) => (
                      <button
                        key={`${selectedProject.id}-${index}`}
                        type="button"
                        onClick={() => setSelectedGalleryImage(index)}
                        className={cn(
                          "overflow-hidden rounded-xl border transition-all",
                          selectedGalleryImage === index ? "border-forest ring-2 ring-forest/30" : "border-border"
                        )}
                      >
                        <img src={image.src} alt={image.alt} className="h-20 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
              <div className="relative h-48 overflow-hidden">
                <img src={selectedProject.image} alt={selectedProject.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-background"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-4 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                  {selectedProject.coordinates.lat.toFixed(4)}N, {Math.abs(selectedProject.coordinates.lng).toFixed(4)}W
                </div>
              </div>
              )}

              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground">{selectedProject.name}</h3>
                    <p className="mt-1 flex items-center gap-2 text-forest">
                      <MapPin size={16} />
                      {selectedProject.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-forest/10 px-3 py-1 text-sm font-medium text-forest">
                    {selectedProject.variety}
                  </span>
                </div>

                <p className="mb-6 leading-relaxed text-muted-foreground">{selectedProject.description}</p>

                {getProjectGallery(selectedProject).length > 0 ? (
                  <div className="mb-6 rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Galeria de la zona</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {getProjectGallery(selectedProject)[selectedGalleryImage].alt}
                    </p>
                    <a
                      href={getProjectGallery(selectedProject)[selectedGalleryImage].sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-medium text-forest transition-colors hover:text-forest-light"
                    >
                      Fuente: {getProjectGallery(selectedProject)[selectedGalleryImage].source}
                    </a>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-xl bg-forest/5 p-4 text-center">
                    <Leaf className="mx-auto mb-2 h-6 w-6 text-forest" />
                    <p className="text-2xl font-bold text-foreground">{selectedProject.hectares}</p>
                    <p className="text-xs text-muted-foreground">Hectareas</p>
                  </div>
                  <div className="rounded-xl bg-forest/5 p-4 text-center">
                    <Users className="mx-auto mb-2 h-6 w-6 text-forest" />
                    <p className="text-2xl font-bold text-foreground">{selectedProject.families}</p>
                    <p className="text-xs text-muted-foreground">Familias</p>
                  </div>
                  <div className="rounded-xl bg-forest/5 p-4 text-center">
                    <Calendar className="mx-auto mb-2 h-6 w-6 text-forest" />
                    <p className="text-2xl font-bold text-foreground">{selectedProject.yearStarted}</p>
                    <p className="text-xs text-muted-foreground">Ano inicio</p>
                  </div>
                  <div className="rounded-xl bg-forest/5 p-4 text-center">
                    <TrendingUp className="mx-auto mb-2 h-6 w-6 text-forest" />
                    <p className="text-lg font-bold text-foreground">{selectedProject.production}</p>
                    <p className="text-xs text-muted-foreground">Produccion</p>
                  </div>
                </div>

                <button className="mt-6 w-full rounded-xl bg-forest py-3 font-semibold text-white transition-colors hover:bg-forest-dark">
                  Conocer mas sobre este proyecto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import 'leaflet/dist/leaflet.css';

        .leaflet-container {
          font-family: inherit;
        }

        .custom-marker {
          background: transparent;
          border: none;
        }

        .leaflet-popup-content-wrapper {
          background: hsl(var(--card));
          border-radius: 12px;
          border: 1px solid hsl(var(--border));
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }

        .leaflet-popup-tip {
          background: hsl(var(--card));
          border: 1px solid hsl(var(--border));
        }

        .leaflet-popup-content {
          margin: 0;
          color: hsl(var(--foreground));
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }

        .leaflet-control-zoom a {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
        }

        .leaflet-control-zoom a:hover {
          background: hsl(var(--accent)) !important;
        }

        .leaflet-control-attribution {
          background: hsl(var(--card) / 0.8) !important;
          color: hsl(var(--muted-foreground)) !important;
          font-size: 10px;
        }

        .leaflet-control-attribution a {
          color: hsl(var(--forest)) !important;
        }
      `}</style>
    </section>
  )
}

function getProjectGallery(project: Project): ProjectGalleryImage[] {
  if (project.gallery && project.gallery.length > 0) {
    return project.gallery
  }

  return [
    {
      src: project.image,
      alt: project.name,
      source: "Makakaw",
      sourceUrl: "#proyectos",
    },
  ]
}
