"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  parseProduction,
  calculateYield,
} from "@/controller/admin-projects-panel-controller";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Edit2,
  Eye,
  EyeOff,
  Factory,
  Globe2,
  ImagePlus,
  Leaf,
  LineChart,
  MapPin,
  MoreVertical,
  Navigation,
  Package,
  PlusCircle,
  Route,
  ShieldCheck,
  Sprout,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/controller/auth-controller";
import { useProjects } from "@/controller/projects-controller";
import { PowerBIReport } from "@/ui/components/dashboard/power-bi-report";
import { AdminProductsPanel } from "@/ui/components/admin-products-panel";
import { AdminEmployeesPanel } from "@/ui/components/admin-employees-panel";
import type { Project, ProjectGalleryImage } from "@/model/projects";
import {
  deleteTourismRoute,
  estimateTime,
  haversineKm,
  loadAllRoutes,
  loadEmpresas,
  saveTourismRoute,
  toggleActivaRoute,
  toggleDestacadaRoute,
  type EmpresaOption,
  type SavedTourismRoute,
  type TourismRouteFormData,
  type TourismRoutePoint,
} from "@/controller/admin-tourism-controller";
import { uploadImage } from "@/services/storage";

const AdminMapLeaflet = dynamic(
  () =>
    import("@/ui/components/admin-map-leaflet").then(
      (mod) => mod.AdminMapLeaflet,
    ),
  {
    ssr: false,
  },
);

const TourismAdminMapLeaflet = dynamic(
  () =>
    import("@/ui/components/tourism-admin-map-leaflet").then(
      (mod) => mod.TourismAdminMapLeaflet,
    ),
  { ssr: false },
);

interface FormState {
  id: number | null;
  name: string;
  nit: string;
  location: string;
  lat: string;
  lng: string;
  description: string;
  hectares: string;
  families: string;
  yearStarted: string;
  production: string;
  variety: string;
  image_url: string;
  status: string;
  gallery: ProjectGalleryImage[];
}

type AdminSection =
  | "resumen"
  | "proyectos"
  | "empleados"
  | "productos"
  | "produccion"
  | "mercado"
  | "importar"
  | "rutas";

const initialFormState: FormState = {
  id: null,
  name: "",
  nit: "",
  location: "",
  lat: "",
  lng: "",
  description: "",
  hectares: "",
  families: "",
  yearStarted: "",
  production: "",
  variety: "",
  image_url: "/images/cacao-pods.jpg",
  status: "Activo",
  gallery: [],
};

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20";

const PROJECT_IMAGE_FALLBACK = "/images/cacao-pods.jpg";

const adminSections: {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "resumen", label: "Resumen", icon: BarChart3 },
  { id: "proyectos", label: "Proyectos", icon: Sprout },
  { id: "empleados", label: "Empleados", icon: Users },
  { id: "productos", label: "Productos", icon: Package },
  { id: "produccion", label: "Produccion", icon: Factory },
  { id: "mercado", label: "Mercado", icon: Globe2 },
  { id: "importar", label: "Importar CSV", icon: Upload },
  { id: "rutas", label: "Rutas Turísticas", icon: Route },
];

export function AdminProjectsPanel() {
  const { user } = useAuth();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>("resumen");
  const [isSaving, setIsSaving] = useState(false);
  const powerBIConfig = {
    publicEmbedUrl: process.env.NEXT_PUBLIC_POWER_BI_PUBLIC_EMBED_URL,
    embedUrl: process.env.NEXT_PUBLIC_POWER_BI_EMBED_URL,
    reportId: process.env.NEXT_PUBLIC_POWER_BI_REPORT_ID,
    accessToken: process.env.NEXT_PUBLIC_POWER_BI_ACCESS_TOKEN,
  };

  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const totalFamilies = projects.reduce(
      (sum: number, project: Project) => sum + project.families,
      0,
    );
    const totalHectares = projects.reduce(
      (sum: number, project: Project) => sum + project.hectares,
      0,
    );
    const totalProduction = projects.reduce(
      (sum: number, project: Project) =>
        sum + parseProduction(project.production),
      0,
    );
    const avgProduction =
      totalProjects > 0 ? Math.round(totalProduction / totalProjects) : 0;
    const newestYear = projects.reduce(
      (max: number, project: Project) => Math.max(max, project.yearStarted),
      0,
    );

    return {
      totalProjects,
      totalFamilies,
      totalHectares,
      totalProduction,
      avgProduction,
      newestYear,
    };
  }, [projects]);

  const marketData = useMemo(
    () => [
      {
        title: "Mix comercial",
        value: "48% exportacion",
        description:
          "Mayor salida para cafe especial, cacao premium y derivados con valor agregado.",
      },
      {
        title: "Canal con mayor crecimiento",
        value: "Retail especializado",
        description:
          "Tiendas gourmet y marcas bean-to-bar con crecimiento sostenido.",
      },
      {
        title: "Oportunidad prioritaria",
        value: "Cafe y cacao premium",
        description:
          "Categorias de origen y trazabilidad con mejor margen comercial.",
      },
      {
        title: "Riesgo comercial",
        value: "Volatilidad de precios",
        description:
          "Conviene monitorear costo logístico, clima y demanda internacional.",
      },
    ],
    [],
  );

  if (user?.role !== "admin") {
    return null;
  }

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleMapClick = (lat: number, lng: number) => {
    setForm((current) => ({
      ...current,
      lat: String(lat),
      lng: String(lng),
    }));
  };

  const handleProjectSelect = (project: Project) => {
    setForm({
      id: project.id,
      name: project.name,
      nit: project.nit,
      location: project.location,
      lat: String(project.coordinates.lat),
      lng: String(project.coordinates.lng),
      description: project.description,
      hectares: String(project.hectares),
      families: String(project.families),
      yearStarted: String(project.yearStarted),
      production: project.production,
      variety: project.variety,
      image_url: project.image_url || "/images/cacao-pods.jpg",
      status: project.status,
      gallery: project.gallery || [],
    });
    document
      .getElementById("admin-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async () => {
    if (
      form.id &&
      window.confirm("¿Seguro que deseas eliminar este proyecto?")
    ) {
      try {
        await deleteProject(form.id);
        setForm(initialFormState);
        setMessage("Proyecto eliminado correctamente.");
      } catch {
        setMessage(
          "Error al eliminar el proyecto. Verifica permisos en Supabase.",
        );
      }
    }
  };

  const handleCancelEdit = () => {
    setForm(initialFormState);
    setMessage("");
  };

  const compressImage = (
    file: File,
    callback: (base64String: string) => void,
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 800;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          callback(canvas.toDataURL("image/webp", 0.7));
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      try {
        const urlDeSupabase = await uploadImage(file);

        if (urlDeSupabase) {
          callback(urlDeSupabase);
        }
      } catch (error) {
        console.error("Error al procesar o subir la imagen:", error);
        setMessage(
          "No se pudo subir la imagen. Verifica el Storage de Supabase.",
        );
      }
    }
  };

  const addGalleryImage = () => {
    setForm((current) => ({
      ...current,
      gallery: [
        ...current.gallery,
        { src: "", alt: "", source: "", sourceUrl: "" },
      ],
    }));
  };

  const updateGalleryImage = (
    index: number,
    field: keyof ProjectGalleryImage,
    value: string,
  ) => {
    setForm((current) => {
      const newGallery = [...current.gallery];
      newGallery[index] = { ...newGallery[index], [field]: value };
      return { ...current, gallery: newGallery };
    });
  };

  const removeGalleryImage = (index: number) => {
    setForm((current) => ({
      ...current,
      gallery: current.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validar galería
    const invalidGallery = form.gallery.some(
      (img) => !img.src.trim() && !img.sourceUrl.trim() && !img.source.trim(),
    );
    if (invalidGallery) {
      setMessage(
        "Cada imagen de la galería debe tener al menos una imagen, URL o fuente.",
      );
      return;
    }

    setIsSaving(true);
    setMessage("");

    const projectData = {
      name: form.name.trim(),
      nit: form.nit.trim(),
      location: form.location.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      description: form.description.trim(),
      hectares: Number(form.hectares),
      families: Number(form.families),
      yearStarted: Number(form.yearStarted),
      production: form.production.trim(),
      variety: form.variety.trim(),
      image: form.image_url || PROJECT_IMAGE_FALLBACK,
      status: form.status,
      gallery: form.gallery,
      ownerId: user?.id, // ← añadir esto
      ownerEmail: user?.email, // ← y esto si lo necesitas
    };

    try {
      if (form.id) {
        await updateProject(form.id, projectData);
        setMessage("Proyecto actualizado correctamente.");
      } else {
        await addProject(projectData);
        setMessage("Proyecto agregado correctamente.");
      }
      setForm(initialFormState);
      setActiveSection("proyectos");
    } catch (error) {
      console.log(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Error al guardar el proyecto. Verifica permisos en Supabase.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusUpdate = async (
    project: Project,
    status: "Aprobado" | "Rechazado",
  ) => {
    await updateProject(project.id, { status });
    if (form.id === project.id) {
      setForm((current) => ({ ...current, status }));
    }
    setMessage(`Proyecto ${status.toLowerCase()} correctamente.`);
  };

  return (
    <section id="admin" className="bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold uppercase tracking-widest">
                  Administrador
                </span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground sm:text-4xl">
                Panel de administracion
              </h2>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Gestiona proyectos, revisa estadisticas de produccion y consulta
                un resumen rapido del mercado desde un solo panel.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricChip
                label="Proyectos"
                value={String(metrics.totalProjects)}
              />
              <MetricChip
                label="Produccion"
                value={`${metrics.totalProduction} t`}
              />
              <MetricChip
                label="Familias"
                value={String(metrics.totalFamilies)}
              />
              <MetricChip
                label="Hectareas"
                value={String(metrics.totalHectares)}
              />
            </div>
          </div>

          <div className="mb-8 overflow-x-auto rounded-2xl border border-border bg-card p-2">
            <div className="flex min-w-max gap-2">
              {adminSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-forest text-white shadow-lg shadow-forest/20"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <Icon size={17} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeSection === "resumen" ? (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="xl:col-span-2">
                <PowerBIReport
                  title="Analitica comercial"
                  publicEmbedUrl={powerBIConfig.publicEmbedUrl}
                  embedUrl={powerBIConfig.embedUrl}
                  reportId={powerBIConfig.reportId}
                  accessToken={powerBIConfig.accessToken}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <DashboardCard
                  title="Capacidad productiva"
                  icon={<Factory size={20} className="text-forest" />}
                  description="Vision general de la operacion actual."
                >
                  <div className="grid grid-cols-2 gap-4">
                    <StatBox
                      label="Produccion total"
                      value={`${metrics.totalProduction} t`}
                    />
                    <StatBox
                      label="Promedio por proyecto"
                      value={`${metrics.avgProduction} t`}
                    />
                    <StatBox
                      label="Hectareas activas"
                      value={`${metrics.totalHectares} ha`}
                    />
                    <StatBox
                      label="Ultimo inicio"
                      value={String(metrics.newestYear)}
                    />
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Impacto territorial"
                  icon={<Leaf size={20} className="text-forest" />}
                  description="Cobertura social y operativa de los proyectos."
                >
                  <div className="space-y-4">
                    <ProgressRow
                      label="Familias vinculadas"
                      value={metrics.totalFamilies}
                      max={800}
                    />
                    <ProgressRow
                      label="Hectareas manejadas"
                      value={metrics.totalHectares}
                      max={3000}
                    />
                    <ProgressRow
                      label="Proyectos publicados"
                      value={metrics.totalProjects}
                      max={12}
                    />
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Desempeno comercial"
                  icon={<TrendingUp size={20} className="text-forest" />}
                  description="Indicadores rapidos para decisiones de negocio."
                >
                  <div className="grid gap-3">
                    <InlineInsight
                      label="Ticket premium"
                      value="Alto"
                      note="Mayor valor en cafe especial, cacao fino y derivados."
                    />
                    <InlineInsight
                      label="Rotacion esperada"
                      value="Media-Alta"
                      note="Buen potencial en temporadas de exportacion."
                    />
                    <InlineInsight
                      label="Diversificacion"
                      value="Activa"
                      note="Portafolio entre cafe, cacao y lineas institucionales."
                    />
                  </div>
                </DashboardCard>

                <DashboardCard
                  title="Resumen de mercado"
                  icon={<LineChart size={20} className="text-forest" />}
                  description="Lectura rapida del contexto comercial."
                >
                  <div className="space-y-3">
                    {marketData.slice(0, 3).map((item) => (
                      <article
                        key={item.title}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 font-semibold text-foreground">
                          {item.value}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </article>
                    ))}
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard
                title="Ultimos proyectos"
                icon={<Sprout size={20} className="text-forest" />}
                description="Verificacion rapida de lo mas reciente en la plataforma."
              >
                <div className="space-y-4">
                  {projects
                    .slice(-5)
                    .reverse()
                    .map((project: Project) => (
                      <article
                        key={project.id}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {project.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {project.location}
                            </p>
                          </div>
                          <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                            {project.yearStarted}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground">
                          <span className="rounded-full bg-forest/10 px-3 py-1">
                            {project.production}
                          </span>
                          <span className="rounded-full bg-forest/10 px-3 py-1">
                            {project.families} familias
                          </span>
                        </div>
                      </article>
                    ))}
                </div>
              </DashboardCard>
            </div>
          ) : null}

          {activeSection === "proyectos" ? (
            <div className="space-y-8" id="admin-form">
              <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-forest/5 to-forest/10 p-4">
                <div className="pointer-events-none absolute left-8 top-8 z-20 rounded-lg border border-border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-medium text-foreground">
                    Mapa interactivo de gestión
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Haz clic en el mapa para agregar punto o selecciona un pin
                    para editar
                  </p>
                </div>
                <div className="h-[400px] w-full relative z-0">
                  <AdminMapLeaflet
                    projects={projects}
                    selectedProjectId={form.id}
                    onProjectSelect={handleProjectSelect}
                    onMapClick={handleMapClick}
                    newPointCoordinates={
                      form.lat && form.lng && !form.id
                        ? { lat: Number(form.lat), lng: Number(form.lng) }
                        : null
                    }
                  />
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 rounded-3xl border border-border bg-card p-6 md:p-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlusCircle className="text-forest" size={24} />
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {form.id
                            ? "Editar proyecto"
                            : "Agregar nuevo proyecto"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Completa la informacion para mostrarlo en el mapa y en
                          el panel.
                        </p>
                      </div>
                    </div>
                    {form.id && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nombre del proyecto">
                      <input
                        value={form.name}
                        onChange={handleChange("name")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="NIT de la empresa">
                      <input
                        value={form.nit}
                        onChange={handleChange("nit")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Ubicacion">
                      <input
                        value={form.location}
                        onChange={handleChange("location")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Latitud">
                      <input
                        type="number"
                        step="0.0001"
                        value={form.lat}
                        onChange={handleChange("lat")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Longitud">
                      <input
                        type="number"
                        step="0.0001"
                        value={form.lng}
                        onChange={handleChange("lng")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Hectareas">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={form.hectares}
                        onChange={handleChange("hectares")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Familias beneficiadas">
                      <input
                        type="number"
                        min="1"
                        value={form.families}
                        onChange={handleChange("families")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Año de inicio">
                      <input
                        type="number"
                        value={form.yearStarted}
                        onChange={handleChange("yearStarted")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Produccion">
                      <input
                        value={form.production}
                        onChange={handleChange("production")}
                        required
                        className={inputClassName}
                        placeholder="45 toneladas/ano"
                      />
                    </Field>
                    <Field label="Variedad">
                      <input
                        value={form.variety}
                        onChange={handleChange("variety")}
                        required
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="Estado de revision">
                      <select
                        value={form.status}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            status: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Rechazado">Rechazado</option>
                        <option value="Activo">Activo</option>
                      </select>
                    </Field>
                    <Field label="Imagen Principal">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(e, (str) =>
                              setForm((c) => ({ ...c, image_url: str })),
                            )
                          }
                          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-forest/10 file:text-forest hover:file:bg-forest/20"
                        />
                        {form.image_url ? (
                          <img
                            src={form.image_url}
                            alt="Imagen principal"
                            onError={(event) => {
                              event.currentTarget.src = PROJECT_IMAGE_FALLBACK;
                            }}
                            className="h-12 w-20 rounded-lg object-cover"
                          />
                        ) : null}
                      </div>
                    </Field>
                  </div>

                  <Field label="Descripcion">
                    <textarea
                      value={form.description}
                      onChange={handleChange("description")}
                      required
                      rows={5}
                      className={`${inputClassName} resize-none`}
                    />
                  </Field>

                  {message ? (
                    <div className="rounded-2xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">
                      {message}
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <PlusCircle size={18} />
                      {isSaving
                        ? "Guardando..."
                        : form.id
                          ? "Actualizar proyecto"
                          : "Guardar proyecto"}
                    </button>
                    {form.id && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/10 text-red-500 px-6 py-3 font-semibold transition-colors hover:bg-red-500/20"
                      >
                        Eliminar proyecto
                      </button>
                    )}
                  </div>
                </form>

                <DashboardCard
                  title="Listado reciente"
                  icon={<Sprout size={20} className="text-forest" />}
                  description="Revision rapida de los proyectos registrados."
                >
                  <div className="max-h-[560px] space-y-4 overflow-y-auto pr-2">
                    {projects
                      .slice()
                      .reverse()
                      .map((project: Project) => (
                        <article
                          key={project.id}
                          className="rounded-2xl border border-border bg-background p-4 cursor-pointer hover:border-forest/50 transition-colors"
                          onClick={() => handleProjectSelect(project)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {project.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {project.location}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <StatusBadge status={project.status} />
                              <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                                {project.yearStarted}
                              </span>
                            </div>
                          </div>
                          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                            {project.description}
                          </p>
                          {project.status === "Pendiente" ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleStatusUpdate(project, "Aprobado");
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-forest px-3 py-2 text-xs font-semibold text-white hover:bg-forest-dark"
                              >
                                <CheckCircle2 size={14} />
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleStatusUpdate(project, "Rechazado");
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                              >
                                <AlertCircle size={14} />
                                Rechazar
                              </button>
                            </div>
                          ) : null}
                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-foreground">
                            <span className="rounded-full bg-forest/10 px-3 py-1">
                              {project.hectares} ha
                            </span>
                            <span className="rounded-full bg-forest/10 px-3 py-1">
                              {project.families} familias
                            </span>
                            <span className="rounded-full bg-forest/10 px-3 py-1">
                              {project.variety}
                            </span>
                            <span className="rounded-full bg-forest/10 px-3 py-1">
                              {project.production}
                            </span>
                          </div>
                        </article>
                      ))}
                  </div>
                </DashboardCard>
              </div>
            </div>
          ) : null}

          {activeSection === "empleados" ? <AdminEmployeesPanel /> : null}

          {activeSection === "productos" ? <AdminProductsPanel /> : null}

          {activeSection === "produccion" ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <DashboardCard
                title="Indicadores de produccion"
                icon={<Factory size={20} className="text-forest" />}
                description="Base operativa para seguimiento interno."
                className="lg:col-span-2"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <StatBox
                    label="Produccion total"
                    value={`${metrics.totalProduction} t`}
                  />
                  <StatBox
                    label="Promedio por proyecto"
                    value={`${metrics.avgProduction} t`}
                  />
                  <StatBox
                    label="Rendimiento estimado"
                    value={`${calculateYield(metrics.totalProduction, metrics.totalHectares)} t/ha`}
                  />
                </div>
                <div className="mt-6 space-y-4">
                  {projects.map((project) => (
                    <article
                      key={project.id}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {project.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project.location} · {project.hectares} ha ·{" "}
                            {project.families} familias
                          </p>
                        </div>
                        <span className="rounded-full bg-forest/10 px-3 py-1 text-sm font-semibold text-forest">
                          {project.production}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard
                title="Notas operativas"
                icon={<Leaf size={20} className="text-forest" />}
                description="Puntos de control sugeridos."
              >
                <div className="space-y-3">
                  <TipCard text="Monitorea fermentacion y secado por lote para mantener perfiles consistentes." />
                  <TipCard text="Relaciona volumen producido con hectareas y clima para detectar variaciones." />
                  <TipCard text="Prioriza proyectos con mejor rendimiento para replicas tecnicas." />
                </div>
              </DashboardCard>
            </div>
          ) : null}

          {activeSection === "importar" ? (
            <CsvImportSection onImportSuccess={() => {}} />
          ) : null}

          {activeSection === "mercado" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {marketData.map((item) => (
                <DashboardCard
                  key={item.title}
                  title={item.title}
                  icon={<Globe2 size={20} className="text-forest" />}
                  description={item.description}
                >
                  <p className="text-2xl font-bold text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Usa este indicador como referencia para decisiones
                    comerciales, priorizacion de portafolio y conversaciones con
                    clientes.
                  </p>
                </DashboardCard>
              ))}
            </div>
          ) : null}

          {activeSection === "rutas" ? <AdminTourismSection /> : null}
        </div>
      </div>
    </section>
  );
}
// ==========================================
// ADMIN TOURISM SECTION
// ==========================================

const DIFFICULTY_OPTIONS = ["Bajo", "Medio", "Alto", "Extremo"];
const POINT_TYPES = [
  "Entrada",
  "Salida",
  "Mirador",
  "Cafetal",
  "Cacaotal",
  "Cascada",
  "Pueblo",
  "Centro de acopio",
  "Punto de interés",
];

const initialRouteForm: TourismRouteFormData = {
  nombre_ruta: "",
  distancia_total: 0,
  nivel_dificultad: "Medio",
  tiempo_estimado: "",
  nit_empresa: "",
  imagen_url: "",
  puntoA: null,
  puntoB: null,
};

function AdminTourismSection() {
  const inputCls =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20";

  const [routeForm, setRouteForm] =
    useState<TourismRouteFormData>(initialRouteForm);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [selectMode, setSelectMode] = useState<"A" | "B" | null>(null);
  const [pendingPointType, setPendingPointType] = useState("Entrada");
  const [pendingPointName, setPendingPointName] = useState("");
  const [savedRoutes, setSavedRoutes] = useState<SavedTourismRoute[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing routes and empresas on mount
  useEffect(() => {
    void loadAllRoutes().then(setSavedRoutes);
    void loadEmpresas().then(setEmpresas);
  }, []);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!selectMode) return;
      const newPoint: TourismRoutePoint = {
        nombre_lugar:
          pendingPointName ||
          (selectMode === "A" ? "Punto de entrada" : "Punto de salida"),
        latitud: lat,
        longitud: lng,
        tipo_punto: pendingPointType,
      };
      setRouteForm((f) => {
        const next = {
          ...f,
          [selectMode === "A" ? "puntoA" : "puntoB"]: newPoint,
        };
        const a = selectMode === "A" ? newPoint : f.puntoA;
        const b = selectMode === "B" ? newPoint : f.puntoB;
        if (a && b) {
          const km =
            Math.round(
              haversineKm(a.latitud, a.longitud, b.latitud, b.longitud) * 10,
            ) / 10;
          next.distancia_total = km;
          next.tiempo_estimado = estimateTime(km, f.nivel_dificultad);
        }
        return next;
      });
      setSelectMode(null);
    },
    [selectMode, pendingPointName, pendingPointType],
  );

  const compressToWebP = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
          "image/webp",
          0.82,
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newFiles = [...imageFiles, ...files].slice(0, 8);
    setImageFiles(newFiles);
    setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!routeForm.nombre_ruta.trim()) {
      setMessage("El nombre de la ruta es obligatorio.");
      return;
    }
    if (!routeForm.nit_empresa) {
      setMessage("Debes seleccionar una empresa operadora.");
      return;
    }
    if (!routeForm.puntoA || !routeForm.puntoB) {
      setMessage(
        "Debes marcar el Punto A (entrada) y el Punto B (salida) en el mapa.",
      );
      return;
    }
    setIsSaving(true);
    setMessage("");

    // Upload images to Supabase Storage
    let uploadedUrls: string[] = [];
    if (imageFiles.length > 0) {
      const { createClient } = await import("@supabase/supabase-js");
      const supa = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      for (const file of imageFiles) {
        try {
          const blob = await compressToWebP(file);
          const path = `rutas/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
          const { error: upErr } = await supa.storage
            .from("Galeria")
            .upload(path, blob, { upsert: true, contentType: "image/webp" });
          if (!upErr) {
            const { data } = supa.storage.from("Galeria").getPublicUrl(path);
            uploadedUrls.push(data.publicUrl);
          }
        } catch {
          /* skip failed */
        }
      }
    }

    const formWithImages: TourismRouteFormData = {
      ...routeForm,
      imagen_url:
        uploadedUrls.length > 0 ? uploadedUrls.join(",") : routeForm.imagen_url,
    };

    const result = await saveTourismRoute(formWithImages, editingId);
    setMessage(result.message);
    if (result.success) {
      setRouteForm(initialRouteForm);
      setEditingId(undefined);
      setImageFiles([]);
      setImagePreviews([]);
      const routes = await loadAllRoutes();
      setSavedRoutes(routes);
      window.dispatchEvent(new CustomEvent("route-saved"));
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta ruta turística?")) return;
    const result = await deleteTourismRoute(id);
    setMessage(result.message);
    if (result.success) {
      setSavedRoutes((prev) => prev.filter((r) => r.id_ruta !== id));
      window.dispatchEvent(new CustomEvent("route-saved"));
    }
  };

  const handleClear = () => {
    setRouteForm(initialRouteForm);
    setEditingId(undefined);
    setSelectMode(null);
    setMessage("");
    setImageFiles([]);
    setImagePreviews([]);
  };

  const pointA = routeForm.puntoA
    ? { lat: routeForm.puntoA.latitud, lng: routeForm.puntoA.longitud }
    : null;
  const pointB = routeForm.puntoB
    ? { lat: routeForm.puntoB.latitud, lng: routeForm.puntoB.longitud }
    : null;

  return (
    <div className="space-y-8">
      {/* Map */}
      <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-forest/5 to-forest/10 p-4">
        {/* Legend */}
        <div className="pointer-events-none absolute left-6 top-6 z-20 flex flex-col gap-2 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
          <p className="text-sm font-semibold text-foreground">
            Mapa de ruta turística
          </p>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                A
              </span>
              {routeForm.puntoA ? routeForm.puntoA.nombre_lugar : "Sin entrada"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                B
              </span>
              {routeForm.puntoB ? routeForm.puntoB.nombre_lugar : "Sin salida"}
            </span>
          </div>
        </div>

        {/* Cursor hint */}
        {selectMode && (
          <div className="pointer-events-none absolute bottom-12 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-background/95 px-5 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
            Haz clic en el mapa para marcar el punto{" "}
            <strong
              className={selectMode === "A" ? "text-green-500" : "text-red-500"}
            >
              {selectMode === "A" ? "A - Entrada" : "B - Salida"}
            </strong>
          </div>
        )}

        <div className="h-[380px] w-full">
          <TourismAdminMapLeaflet
            pointA={pointA}
            pointB={pointB}
            selectMode={selectMode}
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* Selector controls */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Nombre del punto
          </label>
          <input
            value={pendingPointName}
            onChange={(e) => setPendingPointName(e.target.value)}
            placeholder="ej. Finca El Paraíso"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forest focus:ring-2 focus:ring-forest/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Tipo de punto
          </label>
          <select
            value={pendingPointType}
            onChange={(e) => setPendingPointType(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forest"
          >
            {POINT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setSelectMode(selectMode === "A" ? null : "A")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            selectMode === "A"
              ? "bg-green-500 text-white shadow-lg"
              : routeForm.puntoA
                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "bg-green-500 text-white"
          }`}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
            A
          </span>
          {selectMode === "A"
            ? "Cancelar"
            : routeForm.puntoA
              ? "Reubicar A"
              : "Marcar entrada"}
        </button>
        <button
          type="button"
          onClick={() => setSelectMode(selectMode === "B" ? null : "B")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            selectMode === "B"
              ? "bg-red-500 text-white shadow-lg"
              : routeForm.puntoB
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-red-500 text-white"
          }`}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
            B
          </span>
          {selectMode === "B"
            ? "Cancelar"
            : routeForm.puntoB
              ? "Reubicar B"
              : "Marcar salida"}
        </button>
        {(routeForm.puntoA || routeForm.puntoB) && (
          <button
            type="button"
            onClick={() =>
              setRouteForm((f) => ({ ...f, puntoA: null, puntoB: null }))
            }
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Limpiar puntos
          </button>
        )}
      </div>

      {/* Form + List */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Form */}
        <div className="space-y-5 rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <Route size={22} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {editingId ? "Editar ruta" : "Nueva ruta turística"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Completa los datos y marca los puntos en el mapa.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre de la ruta">
              <input
                value={routeForm.nombre_ruta}
                onChange={(e) =>
                  setRouteForm((f) => ({ ...f, nombre_ruta: e.target.value }))
                }
                required
                placeholder="ej. Ruta del Cacao Sagrado"
                className={inputCls}
              />
            </Field>

            <Field label="Dificultad">
              <select
                value={routeForm.nivel_dificultad}
                onChange={(e) =>
                  setRouteForm((f) => ({
                    ...f,
                    nivel_dificultad: e.target.value,
                  }))
                }
                className={inputCls}
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Distancia total (km)">
              <input
                type="number"
                min="0"
                step="0.1"
                value={routeForm.distancia_total}
                onChange={(e) =>
                  setRouteForm((f) => ({
                    ...f,
                    distancia_total: Number(e.target.value),
                  }))
                }
                className={inputCls}
              />
            </Field>

            <Field label="Tiempo estimado">
              <input
                value={routeForm.tiempo_estimado}
                onChange={(e) =>
                  setRouteForm((f) => ({
                    ...f,
                    tiempo_estimado: e.target.value,
                  }))
                }
                placeholder="ej. 3 horas"
                className={inputCls}
              />
            </Field>

            <Field label="Empresa operadora">
              <select
                value={routeForm.nit_empresa}
                onChange={(e) =>
                  setRouteForm((f) => ({ ...f, nit_empresa: e.target.value }))
                }
                className={inputCls}
              >
                <option value="">Selecciona una empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id_empresa} value={emp.nit}>
                    {emp.nombre_comercial} — {emp.nit}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Image uploader */}
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-foreground">
              Imágenes de la ruta (máx. 8)
            </p>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative h-24 w-24 overflow-hidden rounded-xl border border-border shadow-sm"
                >
                  <img
                    src={src}
                    alt={`img-${i}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 8 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition hover:border-forest hover:text-forest"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs">Agregar</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Se comprimen a WebP y se suben al Storage de Supabase.
            </p>
          </div>

          {/* Point summary */}
          <div className="grid gap-3 md:grid-cols-2">
            <div
              className={`rounded-xl border p-3 ${
                routeForm.puntoA
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-dashed border-border"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-green-500">
                Punto A — Entrada
              </p>
              {routeForm.puntoA ? (
                <>
                  <p className="mt-1 font-medium text-foreground">
                    {routeForm.puntoA.nombre_lugar}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {routeForm.puntoA.tipo_punto} ·{" "}
                    {routeForm.puntoA.latitud.toFixed(5)},{" "}
                    {routeForm.puntoA.longitud.toFixed(5)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Sin marcar — usa el botón A arriba
                </p>
              )}
            </div>
            <div
              className={`rounded-xl border p-3 ${
                routeForm.puntoB
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-dashed border-border"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Punto B — Salida
              </p>
              {routeForm.puntoB ? (
                <>
                  <p className="mt-1 font-medium text-foreground">
                    {routeForm.puntoB.nombre_lugar}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {routeForm.puntoB.tipo_punto} ·{" "}
                    {routeForm.puntoB.latitud.toFixed(5)},{" "}
                    {routeForm.puntoB.longitud.toFixed(5)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  Sin marcar — usa el botón B arriba
                </p>
              )}
            </div>
          </div>

          {message && (
            <div className="rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Navigation size={18} />
              {isSaving
                ? "Guardando..."
                : editingId
                  ? "Actualizar ruta"
                  : "Guardar ruta"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-border px-5 py-3 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </div>

        {/* Routes list */}
        <DashboardCard
          title="Rutas registradas"
          icon={<Route size={20} className="text-forest" />}
          description="Listado de rutas turísticas en el sistema."
        >
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {savedRoutes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay rutas registradas aún.
              </p>
            ) : (
              savedRoutes.map((route) => (
                <RouteCard
                  key={route.id_ruta}
                  route={route}
                  isEditing={editingId === route.id_ruta}
                  onEdit={() => {
                    setEditingId(route.id_ruta);
                    setRouteForm({
                      nombre_ruta: route.nombre_ruta,
                      distancia_total: route.distancia_total,
                      nivel_dificultad: route.nivel_dificultad,
                      tiempo_estimado: route.tiempo_estimado,
                      nit_empresa: route.nit_empresa ?? "",
                      imagen_url: route.imagen_url ?? "",
                      puntoA: null,
                      puntoB: null,
                    });
                    setMessage(
                      "Editando ruta. Puedes remarcar los puntos A/B en el mapa.",
                    );
                  }}
                  onDelete={() => void handleDelete(route.id_ruta)}
                  onRouteChange={(updated) =>
                    setSavedRoutes((prev) =>
                      prev.map((r) =>
                        r.id_ruta === updated.id_ruta ? updated : r,
                      ),
                    )
                  }
                />
              ))
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

// ==========================================
// ROUTE CARD — menú de acciones igual que productos
// ==========================================
function RouteCard({
  route,
  isEditing,
  onEdit,
  onDelete,
  onRouteChange,
}: {
  route: SavedTourismRoute;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRouteChange: (updated: SavedTourismRoute) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDestacada, setIsDestacada] = useState(!!route.destacada);
  const [isActiva, setIsActiva] = useState(route.activa !== false);

  // Sync if parent re-renders with fresh data
  useEffect(() => {
    setIsDestacada(!!route.destacada);
    setIsActiva(route.activa !== false);
  }, [route]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleToggleDestacada = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const next = !isDestacada;
    setIsDestacada(next);
    const { success } = await toggleDestacadaRoute(route.id_ruta, next);
    if (!success)
      setIsDestacada(!next); // revert on failure
    else onRouteChange({ ...route, destacada: next });
  };

  const handleToggleActiva = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const next = !isActiva;
    setIsActiva(next);
    const { success } = await toggleActivaRoute(route.id_ruta, next);
    if (!success)
      setIsActiva(!next); // revert on failure
    else onRouteChange({ ...route, activa: next });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete();
  };

  return (
    <article
      className={`relative rounded-2xl border bg-background p-4 transition-colors ${
        isEditing
          ? "border-forest bg-forest/5"
          : isDestacada
            ? "border-amber-400/60 shadow-[0_0_16px_rgba(251,191,36,0.1)]"
            : "border-border"
      } ${!isActiva ? "opacity-50" : ""}`}
    >
      {/* Destacada badge */}
      {isDestacada && (
        <div className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 shadow">
          <Star size={12} fill="currentColor" className="text-neutral-900" />
        </div>
      )}

      {/* Oculta overlay */}
      {!isActiva && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-background/60 backdrop-blur-[2px]">
          <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow">
            <EyeOff size={12} /> Oculta al público
          </span>
        </div>
      )}

      {/* Three-dot menu */}
      <div className="absolute right-3 top-3 z-20" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((p) => !p);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition hover:bg-muted"
        >
          <MoreVertical size={15} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-52 animate-in fade-in slide-in-from-top-1 rounded-xl border border-border bg-card p-1 shadow-xl duration-150 z-50">
            <button
              type="button"
              onClick={handleToggleDestacada}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-amber-400 transition hover:bg-muted"
            >
              <Star size={14} fill={isDestacada ? "currentColor" : "none"} />
              {isDestacada ? "Quitar Destacado" : "Destacar Ruta"}
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground transition hover:bg-muted"
            >
              <Edit2 size={14} /> Editar ruta
            </button>
            <button
              type="button"
              onClick={handleToggleActiva}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground transition hover:bg-muted"
            >
              {isActiva ? (
                <>
                  <EyeOff size={14} /> Ocultar al público
                </>
              ) : (
                <>
                  <Eye size={14} /> Mostrar al público
                </>
              )}
            </button>
            <hr className="my-1 border-border" />
            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Card content */}
      <div
        className="pr-10"
        style={{ paddingLeft: isDestacada ? "2rem" : undefined }}
      >
        <h4 className="font-semibold text-foreground">{route.nombre_ruta}</h4>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-forest/10 px-2 py-0.5 text-forest">
            {route.nivel_dificultad}
          </span>
          <span>{route.distancia_total} km</span>
          <span>{route.tiempo_estimado}</span>
        </div>
      </div>
    </article>
  );
}

// ==========================================
// COMPONENTES AUXILIARES INTERNOS
// ==========================================

function DashboardCard({
  title,
  description,
  icon,
  children,
  className = "",
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-border bg-card p-6 md:p-8 ${className}`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-forest rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function InlineInsight({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-background border border-border gap-1">
      <div>
        <span className="text-sm font-medium text-foreground">{label}: </span>
        <span className="text-sm text-muted-foreground">{note}</span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-1 rounded-md self-start sm:self-center">
        {value}
      </span>
    </div>
  );
}

function TipCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const className = normalized.includes("rechaz")
    ? "bg-red-500/10 text-red-300"
    : normalized.includes("aprob") || normalized.includes("activo")
      ? "bg-forest/10 text-forest"
      : "bg-amber-500/10 text-amber-300";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-focus-within:text-forest">
        {label}
      </label>
      {children}
    </div>
  );
}

// Mock o componente vacío por si falta en tu jerarquía, cámbialo por tu import real si existe
function CsvImportSection({
  onImportSuccess,
}: {
  onImportSuccess: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center">
      <p className="text-muted-foreground">
        Sección de importación CSV disponible.
      </p>
    </div>
  );
}
