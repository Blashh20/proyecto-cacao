"use client"

import { useMemo, useState } from "react"
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const salesByMonth = [
  { month: "Ene", ventas: 12000, usuarios: 320 },
  { month: "Feb", ventas: 14500, usuarios: 410 },
  { month: "Mar", ventas: 13800, usuarios: 390 },
  { month: "Abr", ventas: 17000, usuarios: 460 },
  { month: "May", ventas: 19500, usuarios: 540 },
  { month: "Jun", ventas: 21000, usuarios: 600 },
]

const revenueByChannel = [
  { canal: "Web", valor: 44000 },
  { canal: "Marketplace", valor: 28000 },
  { canal: "Retail", valor: 19000 },
]

const recentOrders = [
  { id: "ORD-1982", cliente: "Comercial Andes", fecha: "2026-05-01", estado: "Pagado", total: 1850000 },
  { id: "ORD-1974", cliente: "Cacao Norte", fecha: "2026-04-30", estado: "En proceso", total: 940000 },
  { id: "ORD-1969", cliente: "Distribuidora Sol", fecha: "2026-04-29", estado: "Pagado", total: 1260000 },
  { id: "ORD-1962", cliente: "Mercado Verde", fecha: "2026-04-28", estado: "Pendiente", total: 680000 },
]

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

  const metrics = useMemo(() => {
    const ventas = salesByMonth.reduce((sum, item) => sum + item.ventas, 0)
    const usuarios = salesByMonth[salesByMonth.length - 1]?.usuarios ?? 0
    const ingresos = revenueByChannel.reduce((sum, item) => sum + item.valor, 0)
    return { ventas, usuarios, ingresos }
  }, [])

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = recentOrders.filter(
      (order) =>
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.cliente.toLowerCase().includes(query.toLowerCase()) ||
        order.estado.toLowerCase().includes(query.toLowerCase())
    )

    return filtered.sort((a, b) => {
      if (sortBy === "fecha") return b.fecha.localeCompare(a.fecha)
      return b.total - a.total
    })
  }, [query, sortBy])

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
              <MetricCard title="Ventas" value={`$${metrics.ventas.toLocaleString("es-CO")}`} detail="+12.5% vs mes anterior" />
              <MetricCard title="Usuarios" value={metrics.usuarios.toLocaleString("es-CO")} detail="+8.2% nuevos registros" />
              <MetricCard title="Ingresos" value={`$${metrics.ingresos.toLocaleString("es-CO")}`} detail="Margen estable 24%" />
            </section>

            <section className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Tendencia de ventas y usuarios</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="ventas" stroke="#5ea57d" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="usuarios" stroke="#b79458" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Ingresos por canal</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByChannel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="canal" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valor" fill="#5ea57d" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-foreground">Ordenes recientes</h3>
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
                        <td className="px-3 py-3 text-muted-foreground">{order.fecha}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-forest/15 px-2.5 py-1 text-xs font-semibold text-forest-light">{order.estado}</span>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-foreground">${order.total.toLocaleString("es-CO")}</td>
                      </tr>
                    ))}
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

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-forest-light">{detail}</p>
    </article>
  )
}
