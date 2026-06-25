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
  profileCompletion: number
}

export type DashboardUserContext = {
  id: string
  email: string
  role: "admin" | "user"
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

async function selectRowsByColumn(
  tableCandidates: readonly string[],
  select: string,
  column: string,
  value: string,
  limit?: number
) {
  if (!value) return []

  for (const table of tableCandidates) {
    let query = supabase.from(table).select(select).eq(column, value)
    if (limit) query = query.limit(limit)
    console.log(`Querying ${table} where ${column} = ${value}`)

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

function getProfileCompletion(profile: DictionaryRow | null) {
  const checks = [
    profile?.primer_nombre,
    profile?.primer_apellido,
    profile?.tipo_identificacion,
    profile?.numero_identificacion,
    profile?.id_usuario,
    profile?.telefono_celular,
    profile?.foto_url,
  ]
  const completed = checks.filter((value) => asString(value).trim().length > 0).length
  return Math.round((completed / checks.length) * 100)
}

async function getUserProfile(user: DashboardUserContext) {
  const fields =
    "id_usuario, numero_identificacion, primer_nombre, primer_apellido, tipo_identificacion, telefono_celular, foto_url, email"

  const byId = await selectRowsByColumn(DICTIONARY_TABLES.usuario, fields, "id_usuario", user.id, 1)
  if (byId[0]) return byId[0]

  const byEmail = await selectRowsByColumn(DICTIONARY_TABLES.usuario, fields, "email", user.email.toLowerCase(), 1)
  return byEmail[0] ?? null
}

async function getUserCompanies(user: DashboardUserContext) {
  const byOwner = await selectRowsByColumn(DICTIONARY_TABLES.empresa, "id_empresa, nombre_comercial", "id_usuario", user.id)
  if (byOwner.length > 0) return byOwner

  return selectRowsByColumn(DICTIONARY_TABLES.empresa, "id_empresa, nombre_comercial", "email", user.email.toLowerCase())
}

async function getUserVentas(user: DashboardUserContext, empresasRows: DictionaryRow[]) {
  const byUser = await selectRowsByColumn(
    DICTIONARY_TABLES.ventas,
    "id_venta, id_usuario, id_empresa, id_producto, cantidad, monto_total, fecha_creacion",
    "id_usuario",
    user.id
  )

  if (byUser.length > 0) return byUser

  const empresaIds = empresasRows.map((row) => asString(row.id_empresa)).filter(Boolean)
  if (empresaIds.length === 0) return []

  for (const table of DICTIONARY_TABLES.ventas) {
    const { data, error } = await supabase
      .from(table)
      .select("id_venta, id_usuario, id_empresa, id_producto, cantidad, monto_total, fecha_creacion")
      .in("id_empresa", empresaIds)

    if (!error && Array.isArray(data)) return data as unknown as DictionaryRow[]
  }

  return []
}

export async function fetchDashboardData(user: DashboardUserContext): Promise<DashboardData> {
  const isAdmin = user.role === "admin"
  const profilePromise = getUserProfile(user)
  const empresasPromise = isAdmin
    ? selectRows(DICTIONARY_TABLES.empresa, "id_empresa, nombre_comercial")
    : getUserCompanies(user)

  const [empresasRows, usuarios, productos, profile] = await Promise.all([
    empresasPromise,
    isAdmin ? countRows(DICTIONARY_TABLES.usuario) : Promise.resolve(1),
    countRows(DICTIONARY_TABLES.productosDerivados),
    profilePromise,
  ])

  const ventasRows = isAdmin
    ? await selectRows(
        DICTIONARY_TABLES.ventas,
        "id_venta, id_empresa, id_producto, cantidad, monto_total, fecha_creacion"
      )
    : await getUserVentas(user, empresasRows)

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
    profileCompletion: getProfileCompletion(profile),
  }
}
