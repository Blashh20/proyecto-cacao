"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Calendar,
  Leaf,
  MapPin,
  Mountain,
  TreePine,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { useProjects } from "@/controller/projects-controller";
import { cn } from "@/ui/utils";
import type { Project, ProjectGalleryImage } from "@/model/projects";

const PROJECT_IMAGE_FALLBACK = "/images/cacao-pods.jpg";

const ProjectsMapLeaflet = dynamic(
  () =>
    import("@/ui/components/projects-map-leaflet").then(
      (mod) => mod.ProjectsMapLeaflet,
    ),
  {
    ssr: false,
  },
);

function MapComponent({
  projects,
  onProjectClick,
  hoveredProject,
}: {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  hoveredProject: number | null;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-2xl bg-card/50 shadow-sm sm:h-[380px] lg:h-[440px]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-forest border-t-transparent" />
          <p className="text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectsMapLeaflet
      projects={projects}
      onProjectClick={onProjectClick}
      hoveredProject={hoveredProject}
    />
  );
}

export function ProjectsMapSection() {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0);
  const styleModes = ["default", "card", "elevated"] as const;
  type StyleMode = (typeof styleModes)[number];
  const [styleMode, setStyleMode] = useState<StyleMode>("default");

  useEffect(() => {
    setSelectedGalleryImage(0);
  }, [selectedProject?.id]);

  const cycleStyleMode = () => {
    const nextIndex = (styleModes.indexOf(styleMode) + 1) % styleModes.length;
    setStyleMode(styleModes[nextIndex]);
  };

  const projectCardBase =
    "w-full rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4";
  const projectCardVariant =
    styleMode === "card"
      ? "border-border bg-card shadow-sm"
      : styleMode === "elevated"
        ? "border-forest/20 bg-background/95 shadow-lg"
        : "border-border bg-background";

  const mapWrapperVariant =
    styleMode === "card"
      ? "bg-card shadow-sm"
      : styleMode === "elevated"
        ? "bg-background/95 shadow-lg"
        : "bg-gradient-to-br from-forest/5 to-forest/10";

  return (
    <section
      id="proyectos"
      className="relative overflow-hidden bg-background py-14 sm:py-16 lg:py-20"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full border border-forest" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full border border-forest" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center lg:mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-forest/50 px-4 py-2">
            <Mountain size={18} />
            <span className=" font-medium uppercase tracking-wider">
              Territorios de origen
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-serif font-bold text-foreground sm:text-4xl lg:text-5xl">
            Proyectos y territorios
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Explora los proyectos que Makakaw articula junto a productores y
            aliados en cafe y cacao para fortalecer origen, calidad y desarrollo
            rural.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-5">
          <div className="order-2 space-y-3 lg:order-1 lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <TreePine className="text-forest" size={20} />
              Puntos de desarrollo
            </h3>

            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2 sm:max-h-[420px] lg:max-h-[480px]">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className={cn(
                    projectCardBase,
                    projectCardVariant,
                    selectedProject?.id === project.id
                      ? "border-forest bg-forest/10"
                      : hoveredProject === project.id
                        ? "border-forest/50 bg-forest/5"
                        : "hover:border-forest/30",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={getProjectImage(project)}
                      alt={project.name}
                      onError={(event) => {
                        event.currentTarget.src = PROJECT_IMAGE_FALLBACK;
                      }}
                      className="h-16 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                        selectedProject?.id === project.id
                          ? "bg-forest text-white"
                          : "bg-forest/20 text-forest",
                      )}
                    >
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {project.name}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {project.location}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
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
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3">
            <div
              className={cn(
                "relative isolate overflow-hidden rounded-2xl border p-3 sm:p-4",
                mapWrapperVariant,
                "transition-all duration-300",
              )}
            >
              <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:left-8 sm:top-8 sm:px-4">
                <p className="text-sm font-medium text-foreground">
                  Makakaw en Colombia
                </p>
                <p className="text-xs text-muted-foreground">
                  Mapa interactivo de proyectos
                </p>
              </div>

              <MapComponent
                projects={projects}
                onProjectClick={setSelectedProject}
                hoveredProject={hoveredProject}
              />

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Haz clic en los marcadores verdes para ver la informacion de
                cada proyecto.
              </p>
            </div>
          </div>
        </div>

        {selectedProject && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            />
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-300">
              {/* Imagen + botón cerrar */}
              <div className="relative h-40 overflow-hidden sm:h-48">
                <img
                  src={
                    getProjectGallery(selectedProject)[selectedGalleryImage]
                      ?.src ?? getProjectImage(selectedProject)
                  }
                  alt={selectedProject.name}
                  onError={(event) => {
                    event.currentTarget.src = PROJECT_IMAGE_FALLBACK;
                  }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/80"
                >
                  <X size={16} />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-forest/90 px-2.5 py-0.5 text-xs font-medium text-white">
                  {selectedProject.variety}
                </span>
              </div>

              <div className="p-4 sm:p-5">
                {/* Título y ubicación */}
                <div className="mb-3">
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    {selectedProject.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-forest">
                    <MapPin size={14} />
                    {selectedProject.location}
                  </p>
                </div>

                {/* Descripción */}
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {selectedProject.description}
                </p>

                {/* Stats en fila */}
                <div className="mb-4 grid grid-cols-4 gap-2">
                  <div className="rounded-xl bg-forest/5 p-2.5 text-center">
                    <Leaf className="mx-auto mb-1 h-4 w-4 text-forest" />
                    <p className="text-base font-bold text-foreground">
                      {selectedProject.hectares}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Hectáreas
                    </p>
                  </div>
                  <div className="rounded-xl bg-forest/5 p-2.5 text-center">
                    <Users className="mx-auto mb-1 h-4 w-4 text-forest" />
                    <p className="text-base font-bold text-foreground">
                      {selectedProject.families}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Familias
                    </p>
                  </div>
                  <div className="rounded-xl bg-forest/5 p-2.5 text-center">
                    <Calendar className="mx-auto mb-1 h-4 w-4 text-forest" />
                    <p className="text-base font-bold text-foreground">
                      {selectedProject.yearStarted}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Inicio</p>
                  </div>
                  <div className="rounded-xl bg-forest/5 p-2.5 text-center">
                    <TrendingUp className="mx-auto mb-1 h-4 w-4 text-forest" />
                    <p className="text-sm font-bold text-foreground leading-tight">
                      {selectedProject.production}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Producción
                    </p>
                  </div>
                </div>

                {/* Galería (solo si tiene más de 1 imagen) */}
                {getProjectGallery(selectedProject).length > 1 && (
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {getProjectGallery(selectedProject).map((image, index) => (
                      <button
                        key={`${selectedProject.id}-${index}`}
                        onClick={() => setSelectedGalleryImage(index)}
                        className={cn(
                          "h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all",
                          selectedGalleryImage === index
                            ? "border-forest ring-1 ring-forest/30"
                            : "border-border opacity-70",
                        )}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          onError={(event) => {
                            event.currentTarget.src = PROJECT_IMAGE_FALLBACK;
                          }}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Coordenadas + CTA */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {selectedProject.coordinates.lat.toFixed(4)}N,{" "}
                    {Math.abs(selectedProject.coordinates.lng).toFixed(4)}W
                  </span>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=bdguerra@unicesar.edu.co&su=Solicitud de información sobre ${encodeURIComponent(selectedProject.name)}&body=${encodeURIComponent(
                      `Hola,

                      Estoy interesado(a) en conocer más información sobre el proyecto "${selectedProject.name}" ubicado en ${selectedProject.location}.

                      Quedo atento(a) a su respuesta.`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-dark"
                  >
                    Conocer más
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
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
  );
}

function getProjectGallery(project: Project): ProjectGalleryImage[] {
  const gallery = (project.gallery ?? []).filter((image) => image.src?.trim());

  if (gallery.length > 0) {
    return gallery;
  }

  return [
    {
      src: getProjectImage(project),
      alt: project.name,
      source: "Makakaw",
      sourceUrl: "#proyectos",
    },
  ];
}

function getProjectImage(project: Project): string {
  return project.image_url?.trim() || PROJECT_IMAGE_FALLBACK;
}
