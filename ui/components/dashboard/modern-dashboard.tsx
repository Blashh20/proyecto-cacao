"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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
import { useAuth } from "@/controller/auth-controller"
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
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<"fecha" | "total">("fecha")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadDashboardData() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage("")
        const data = await fetchDashboardData(user)
        // Muestra en consola los datos crudos que alimentan las tarjetas y la tabla del dashboard.
        console.groupCollapsed("[Dashboard] Datos cargados")
        console.log("Usuario:", user)
        console.log("Metricas:", {
          ventas: data.ventas,
          usuarios: data.usuarios,
          ingresos: data.ingresos,
          empresas: data.empresas,
          productos: data.productos,
          profileCompletion: data.profileCompletion,
        })
        console.table(data.orders)
        console.log("Payload completo:", data)
        console.groupEnd()
        if (isMounted) setDashboardData(data)
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar los datos del dashboard.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    if (!isAuthLoading) {
      void loadDashboardData()
    }

    return () => {
      isMounted = false
    }
  }, [isAuthLoading, user])

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

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-foreground">
        <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Cargando tu sesion...
        </div>
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-foreground">
        <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold">Debes iniciar sesion</h1>
          <p className="mt-2 text-muted-foreground">Accede con Google o con tu correo para ver tu dashboard personal.</p>
          <Link href="/" className="mt-6 inline-flex rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90">
            Ir al inicio
          </Link>
        </div>
      </main>
    )
  }

  const isAdmin = user.role === "admin"
  const dashboardTitle = isAdmin ? "Makakaw Admin" : "Mi dashboard"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card p-4 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">{dashboardTitle}</h2>
            <button className="rounded-md p-2 text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition hover:bg-background"
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Contenido Principal */}
        <div className="w-full lg:ml-0">
          <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              <button className="rounded-lg p-2 text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div className="relative w-full max-w-xl">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar en Makakaw..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 placeholder:text-muted-foreground"
                />
              </div>
              <button className="relative rounded-xl border border-border p-2 text-muted-foreground">
                <Bell size={18} />
              </button>
              <Link href="/perfil" className="flex min-w-0 items-center gap-2 rounded-xl border border-border px-2 py-1.5">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-36 truncate text-sm font-medium text-foreground sm:block">{user.name}</span>
              </Link>
            </div>
          </header>

          <main className="px-4 py-5 md:px-6">
            <section className="mb-5 rounded-2xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{isAdmin ? "Vista administrativa" : "Vista personal"}</p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">Hola, {user.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isAdmin
                  ? "Estas viendo la actividad general registrada en Supabase."
                  : "Estos datos pertenecen a tu cuenta y se completan automaticamente con la informacion disponible de tu inicio de sesion."}
              </p>
            </section>
            {/* Tarjetas de Métricas (Aquí llamarías a tu estado de Supabase) */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard title={isAdmin ? "Ventas registradas" : "Mis compras"} value={formatCount(dashboardData?.ventas, isLoading)} detail={isAdmin ? "Registros reales en tabla ventas" : "Ventas asociadas a tu usuario"} />
              <MetricCard title={isAdmin ? "Usuarios" : "Mi perfil"} value={isAdmin ? formatCount(dashboardData?.usuarios, isLoading) : formatPercent(dashboardData?.profileCompletion, isLoading)} detail={isAdmin ? "Cuentas registradas en usuarios" : "Informacion completada"} />
              <MetricCard title={isAdmin ? "Ingresos" : "Total comprado"} value={formatCurrency(dashboardData?.ingresos, isLoading)} detail={isAdmin ? "Suma de monto_total en ventas" : "Suma de tus compras registradas"} />
            </section>

            {errorMessage ? (
              <section className="mt-5 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </section>
            ) : null}

            <section className="mt-5 grid gap-4 md:grid-cols-2">
              <MetricCard title={isAdmin ? "Empresas" : "Mis empresas"} value={formatCount(dashboardData?.empresas, isLoading)} detail={isAdmin ? "Empresas disponibles para el mapa" : "Empresas asociadas a tu usuario"} />
              <MetricCard title="Productos" value={formatCount(dashboardData?.productos, isLoading)} detail="Productos derivados registrados" />
            </section>

            <section className="mt-5 rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-foreground">{isAdmin ? "Ventas recientes" : "Mis ventas recientes"}</h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as "fecha" | "total")}
                    className="rounded-lg border border-border bg-input px-2 py-1.5 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
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
                          No hay ventas asociadas a tu cuenta para mostrar.
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

function formatPercent(value: number | undefined, isLoading: boolean) {
  if (isLoading) return "Cargando..."
  return `${value ?? 0}%`
}

function MetricCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-forest-light">{detail}</p>
    </article>
  )
}
