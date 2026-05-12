"use client"

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart2, Leaf, MapPin, TrendingUp } from "lucide-react"

import { useDashboardController, type ImpactoMetrics, type MonitoreoMetrics, type VentasMetrics } from "@/controller/dashboard-controller"
import { useAuth } from "@/controller/auth-controller"

const COLORS = ["#2D6A4F", "#52B788", "#D4A373", "#95D5B2", "#A98467", "#CCD5AE"]

type TabId = "monitoreo" | "impacto" | "ventas"

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "monitoreo", label: "Monitoreo de Fincas", icon: MapPin },
  { id: "impacto", label: "Impacto Ambiental", icon: Leaf },
  { id: "ventas", label: "Ventas y Rentabilidad", icon: TrendingUp },
]

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function KpiCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">
        {value}
        {unit && <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function MonitoreoTab({ metrics }: { metrics: MonitoreoMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Fincas Certificadas UE" value={metrics.fincasCertificadasUE} />
        <KpiCard label="Hectáreas Gestionadas" value={fmt(metrics.hectareasGestionadas)} unit="ha" />
        <KpiCard label="Asistencias Técnicas" value={metrics.asistenciasTecnicas} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Servicios por tipo */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Tipos de Servicios Técnicos</h4>
          {metrics.serviciosPorTipo.length === 0 ? (
            <EmptyChart message="Sin datos de asistencias técnicas" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.serviciosPorTipo} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="tipo" tick={{ fontSize: 12 }} width={90} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Bar dataKey="count" name="Asistencias" radius={[0, 6, 6, 0]}>
                  {metrics.serviciosPorTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Fincas por región */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Fincas por Región</h4>
          {metrics.fincasPorRegion.length === 0 ? (
            <EmptyChart message="Sin datos de fincas por región" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.fincasPorRegion} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Bar dataKey="count" name="Fincas" radius={[6, 6, 0, 0]}>
                  {metrics.fincasPorRegion.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function ImpactoTab({ metrics }: { metrics: ImpactoMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Total Hectáreas Conservadas" value={fmt(metrics.totalConservadas)} unit="ha" />
        <KpiCard label="Índice de Salud Ecológica (Prom.)" value={fmt(metrics.avgSalud, 2)} unit="%" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Donut - distribución por finca */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Distribución de Conservación por Finca
          </h4>
          {metrics.distribucionFinca.length === 0 ? (
            <EmptyChart message="Sin datos de conservación" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={metrics.distribucionFinca}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {metrics.distribucionFinca.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v: number) => [`${fmt(v)} ha`, "Conservadas"]}
                />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Índice de regeneración */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Índice de Regeneración por Finca</h4>
          {metrics.regeneracionFinca.length === 0 ? (
            <EmptyChart message="Sin datos de regeneración" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metrics.regeneracionFinca} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="finca" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v: number) => [`${fmt(v)}%`, "Regeneración"]}
                />
                <Bar dataKey="indice" name="Índice" radius={[6, 6, 0, 0]}>
                  {metrics.regeneracionFinca.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function CustomTreemapContent(props: Record<string, unknown>) {
  const x = props.x as number
  const y = props.y as number
  const width = props.width as number
  const height = props.height as number
  const name = props.name as string
  const value = props.value as number
  const depth = props.depth as number
  const index = props.index as number

  if (depth === 0) return null

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={COLORS[index % COLORS.length]} rx={6} stroke="#fff" strokeWidth={2} />
      {width > 70 && height > 35 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="white" fontSize={12} fontWeight={600}>
            {name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="white" fontSize={11}>
            {(value / 1000).toFixed(0)}k
          </text>
        </>
      )}
    </g>
  )
}

function VentasTab({ metrics }: { metrics: VentasMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard label="Ingresos Totales por Ventas" value={`${fmt(metrics.totalIngresos / 1000, 0)} mil`} />
        <KpiCard label="Utilidad Neta" value={`${fmt(metrics.totalUtilidad / 1000, 0)} mil`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ventas por día agrupadas por producto */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Ventas por Día y Producto</h4>
          {metrics.ventasPorDia.length === 0 ? (
            <EmptyChart message="Sin datos de ventas por día" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metrics.ventasPorDia} margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="dia" label={{ value: "Día", position: "insideBottom", offset: -2, fontSize: 11 }} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v: number) => [fmt(v), ""]}
                />
                <Legend iconType="circle" iconSize={10} />
                {metrics.productosUnicos.map((product, i) => (
                  <Bar key={product} dataKey={product} name={product} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Treemap ventas totales por producto */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Ventas Totales por Producto</h4>
          {metrics.porProducto.length === 0 ? (
            <EmptyChart message="Sin datos de ventas" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <Treemap
                data={metrics.porProducto}
                dataKey="size"
                aspectRatio={4 / 3}
                content={<CustomTreemapContent />}
              >
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(v: number) => [fmt(v), "Ventas"]}
                />
              </Treemap>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    </div>
  )
}

export function StatsDashboardSection() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>("monitoreo")
  const {
    regiones,
    selectedRegion,
    setSelectedRegion,
    isLoading,
    monitoreoMetrics,
    impactoMetrics,
    ventasMetrics,
  } = useDashboardController()

  if (user?.role !== "admin") return null

  return (
    <section id="dashboard-estadistico" className="border-y border-border bg-muted/20 py-20">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
              <BarChart2 size={16} />
              <span className="text-sm font-semibold uppercase tracking-widest">Dashboard Estadístico</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">
              Monitoreo Operativo y Ambiental
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Datos en tiempo real desde Supabase · Solo visible para administradores
            </p>
          </div>

          {/* Filtro región */}
          {regiones.length > 0 && (
            <div className="shrink-0">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Filtrar por región
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
              >
                <option value="">Todas las regiones</option>
                {regiones.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-border bg-background p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === id
                  ? "bg-forest text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            {activeTab === "monitoreo" && <MonitoreoTab metrics={monitoreoMetrics} />}
            {activeTab === "impacto" && <ImpactoTab metrics={impactoMetrics} />}
            {activeTab === "ventas" && <VentasTab metrics={ventasMetrics} />}
          </>
        )}
      </div>
    </section>
  )
}
