"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  CreditCard,
  Home,
  LineChart as LineChartIcon,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react"
import { PowerBIReport } from "@/ui/components/dashboard/power-bi-report"
import { fetchDashboardData, type DashboardData } from "@/services/dashboard-service"

const navItems = [
  { label: "Inicio", icon: Home },
  { label: "Ventas", icon: ShoppingCart },
  { label: "Usuarios", icon: Users },
  { label: "Analitica", icon: LineChartIcon },
  { label: "Facturacion", icon: CreditCard },
  { label: "Configuracion", icon: Settings },
]

export function ModernDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<"fecha" | "total">("fecha")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const powerBIConfig = {
    publicEmbedUrl: process.env.NEXT_PUBLIC_POWER_BI_PUBLIC_EMBED_URL,
    embedUrl: process.env.NEXT_PUBLIC_POWER_BI_EMBED_URL,
    reportId: process.env.NEXT_PUBLIC_POWER_BI_REPORT_ID,
    accessToken: process.env.NEXT_PUBLIC_POWER_BI_ACCESS_TOKEN,
  }

  useEffect(() => {
    let isMounted = true

    async function loadDashboardData() {
      try {
        setIsLoading(true)
        setErrorMessage("")
        const data = await fetchDashboardData()
        if (isMounted) setDashboardData(data)
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar los datos del dashboard.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = (dashboardData?.orders ?? []).filter(
      (order) =>
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.cliente.toLowerCase().includes(query.toLowerCase()) ||
        order.estado.toLowerCase().includes(query.toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      if (sortBy === "fecha") return b.fecha.localeCompare(a.fecha)
      return b.total - a.total
    })
  }, [dashboardData?.orders, query, sortBy])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card p-4 transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
            <button className="rounded-md p-2 text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = index === 0
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    isActive ? "bg-forest/15 text-forest-light" : "text-muted-foreground hover:bg-background"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="w-full lg:ml-0">
          <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              <button className="rounded-lg p-2 text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="relative w-full max-w-xl">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar orden, cliente o estado..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none ring-forest/30 transition focus:ring-2"
                />
              </div>
              <button className="relative rounded-xl border border-border p-2 text-muted-foreground">
                <Bell size={18} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-forest-light" />
              </button>
            </div>
          </header>

          <main className="px-4 py-5 md:px-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard title="Ventas registradas" value={formatCount(dashboardData?.ventas, isLoading)} detail="Registros reales en tabla ventas" />
              <MetricCard title="Usuarios" value={formatCount(dashboardData?.usuarios, isLoading)} detail="Cuentas registradas en usuarios" />
              <MetricCard title="Ingresos" value={formatCurrency(dashboardData?.ingresos, isLoading)} detail="Suma de monto_total en ventas" />
            </section>

            {errorMessage ? (
              <section className="mt-5 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </section>
            ) : null}

            <section className="mt-5 grid gap-4 md:grid-cols-2">
              <MetricCard title="Empresas" value={formatCount(dashboardData?.empresas, isLoading)} detail="Empresas disponibles para el mapa" />
              <MetricCard title="Productos" value={formatCount(dashboardData?.productos, isLoading)} detail="Productos derivados registrados" />
            </section>

            <section className="mt-5">
              <PowerBIReport
                title="Analitica comercial"
                publicEmbedUrl={powerBIConfig.publicEmbedUrl}
                embedUrl={powerBIConfig.embedUrl}
                reportId={powerBIConfig.reportId}
                accessToken={powerBIConfig.accessToken}
              />
            </section>

            <section className="mt-5 rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-foreground">Ventas recientes</h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as "fecha" | "total")}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    <option value="fecha">Fecha</option>
                    <option value="total">Total</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2">Orden</th>
                      <th className="px-3 py-2">Cliente</th>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/40 text-sm">
                        <td className="px-3 py-3 font-medium text-foreground">{order.id}</td>
                        <td className="px-3 py-3 text-muted-foreground">{order.cliente}</td>
                        <td className="px-3 py-3 text-muted-foreground">{new Date(order.fecha).toLocaleDateString("es-CO")}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-forest/15 px-2.5 py-1 text-xs font-semibold text-forest-light">{order.estado}</span>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-foreground">${order.total.toLocaleString("es-CO")}</td>
                      </tr>
                    ))}
                    {!isLoading && filteredAndSortedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                          No hay ventas registradas para mostrar.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>

      {sidebarOpen ? <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}
    </div>
  )
}

function formatCount(value: number | undefined, isLoading: boolean) {
  if (isLoading) return "Cargando..."
  return (value ?? 0).toLocaleString("es-CO")
}

function formatCurrency(value: number | undefined, isLoading: boolean) {
  if (isLoading) return "Cargando..."
  return `$${(value ?? 0).toLocaleString("es-CO")} COP`
}

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-forest-light">{detail}</p>
    </article>
  )
}
