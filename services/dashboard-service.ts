import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

type DictionaryRow = Record<string, unknown>

export type DashboardOrder = {
  id: string
  cliente: string
  fecha: string
  estado: string
  total: number
  items: number
}

export type DashboardData = {
  ventas: number
  usuarios: number
  ingresos: number
  empresas: number
  productos: number
  orders: DashboardOrder[]
}

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value)

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

async function countRows(tableCandidates: readonly string[]) {
  for (const table of tableCandidates) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })

    if (!error) return count ?? 0
  }

  return 0
}

async function selectRows(tableCandidates: readonly string[], select: string, limit?: number) {
  for (const table of tableCandidates) {
    let query = supabase.from(table).select(select)
    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (!error && Array.isArray(data)) return data as unknown as DictionaryRow[]
  }

  return []
}

function mapBy(rows: DictionaryRow[], key: string) {
  const result = new Map<string, DictionaryRow>()

  for (const row of rows) {
    const id = asString(row[key])
    if (id) result.set(id, row)
  }

  return result
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [ventasRows, empresasRows, usuarios, productos] = await Promise.all([
    selectRows(
      DICTIONARY_TABLES.ventas,
      "id_venta, id_empresa, id_producto, cantidad, monto_total, fecha_creacion"
    ),
    selectRows(DICTIONARY_TABLES.empresa, "id_empresa, nombre_comercial"),
    countRows(DICTIONARY_TABLES.usuario),
    countRows(DICTIONARY_TABLES.productosDerivados),
  ])

  const empresasById = mapBy(empresasRows, "id_empresa")
  const ingresos = ventasRows.reduce((sum, row) => sum + asNumber(row.monto_total), 0)

  const orders = ventasRows
    .map((row, index) => {
      const empresa = empresasById.get(asString(row.id_empresa))

      return {
        id: asString(row.id_venta, String(index + 1)),
        cliente: asString(empresa?.nombre_comercial, asString(row.id_empresa, "Sin empresa")),
        fecha: asString(row.fecha_creacion, new Date().toISOString()),
        estado: "Registrada",
        total: asNumber(row.monto_total),
        items: asNumber(row.cantidad),
      }
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 20)

  return {
    ventas: ventasRows.length,
    usuarios,
    ingresos,
    empresas: empresasRows.length,
    productos,
    orders,
  }
}
