import type { ProductItem } from "@/model/products"
import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

const PRODUCT_IMAGES_BUCKET = "Galeria"
const FALLBACK_PRODUCT_IMAGE = "/images/cacao-beans.jpg"

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value)

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

const asNullableNumber = (value: unknown): number | null => {
  if (value == null || value === "") return null
  const parsed = asNumber(value, Number.NaN)
  return Number.isFinite(parsed) ? parsed : null
}

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

function getProductImageUrl(value: unknown): string {
  const rawValue = asString(value).trim()
  if (!rawValue) return FALLBACK_PRODUCT_IMAGE
  if (isAbsoluteUrl(rawValue) || rawValue.startsWith("/")) return rawValue

  const storagePath = rawValue
    .replace(/^public\//, "")
    .replace(new RegExp(`^${PRODUCT_IMAGES_BUCKET}/`), "")

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl || FALLBACK_PRODUCT_IMAGE
}

// Consulta productos, precios e imagenes relacionadas desde Supabase.
export async function fetchProducts(): Promise<ProductItem[]> {
  const productsRes = await supabase
    .from(DICTIONARY_TABLES.productosDerivados[0])
    .select("*")
    .order("fecha_creacion", { ascending: false })

  if (productsRes.error || !Array.isArray(productsRes.data)) {
    throw new Error(productsRes.error?.message ?? "No se pudieron consultar productos_derivados")
  }

  const productIds = productsRes.data.map((row) => asString(row.id_producto)).filter(Boolean)
  const [catalogRes, linksRes] = await Promise.all([
    productIds.length > 0
      ? supabase
          .from(DICTIONARY_TABLES.catalogoEmpresa[0])
          .select("*")
          .in("id_producto", productIds)
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? supabase
          .from(DICTIONARY_TABLES.vinculoGaleria[0])
          .select("*")
          .eq("entidad_tipo", "PRODUCTO")
      : Promise.resolve({ data: [], error: null }),
  ])

  const catalogByProductId = new Map<string, Record<string, unknown>>()
  const companyIds = new Set<string>()
  if (!catalogRes.error && Array.isArray(catalogRes.data)) {
    for (const row of catalogRes.data as Record<string, unknown>[]) {
      const productId = asString(row.id_producto)
      const companyId = asString(row.id_empresa)
      if (companyId) companyIds.add(companyId)
      if (productId && !catalogByProductId.has(productId)) {
        catalogByProductId.set(productId, row)
      }
    }
  }

  const companiesById = new Map<string, Record<string, unknown>>()
  if (companyIds.size > 0) {
    const companiesRes = await supabase
      .from(DICTIONARY_TABLES.empresa[0])
      .select("id_empresa, nombre_comercial, nit")
      .in("id_empresa", [...companyIds])

    if (!companiesRes.error && Array.isArray(companiesRes.data)) {
      for (const row of companiesRes.data as Record<string, unknown>[]) {
        const companyId = asString(row.id_empresa)
        if (companyId) companiesById.set(companyId, row)
      }
    }
  }

  const photoIdByProductId = new Map<string, string>()
  for (const row of productsRes.data as Record<string, unknown>[]) {
    const productId = asString(row.id_producto)
    const photoId = asString(row.id_galeria_foto)
    if (productId && photoId) photoIdByProductId.set(productId, photoId)
  }

  if (!linksRes.error && Array.isArray(linksRes.data)) {
    for (const row of linksRes.data as Record<string, unknown>[]) {
      const productId = asString(row.id_producto ?? row.id_entidad ?? row.entidad_id ?? row.id_empresa)
      const photoId = asString(row.id_foto)
      if (productId && photoId && !photoIdByProductId.has(productId)) {
        photoIdByProductId.set(productId, photoId)
      }
    }
  }

  const photoIds = [...new Set([...photoIdByProductId.values()])]
  const imageByPhotoId = new Map<string, string>()

  if (photoIds.length > 0) {
    const photosRes = await supabase
      .from(DICTIONARY_TABLES.galeriaFotos[0])
      .select("id_foto, url_foto")
      .in("id_foto", photoIds)

    if (!photosRes.error && Array.isArray(photosRes.data)) {
      for (const row of photosRes.data as Record<string, unknown>[]) {
        const photoId = asString(row.id_foto)
        if (photoId) imageByPhotoId.set(photoId, getProductImageUrl(row.url_foto))
      }
    }
  }

  return productsRes.data.map((row, index) => {
    const productId = asString(row.id_producto, `prod-${index}`)
    const photoId = photoIdByProductId.get(productId)
    const imageUrl = photoId ? imageByPhotoId.get(photoId) ?? null : null
    const catalog = catalogByProductId.get(productId)
    const companyId = asString(catalog?.id_empresa)
    const company = companiesById.get(companyId)
    const suggestedPrice = asNullableNumber(catalog?.precio_sugerido ?? catalog?.precio_unitario)

    return {
      id_producto: productId,
      nombre_derivado: asString(row.nombre_derivado, "Producto sin nombre"),
      imagen_url: imageUrl ?? getProductImageUrl(row.imagen_url ?? row.url_foto),
      tag: asString(row.categoria, "Makakaw"),
      rating: 4.8,
      descripcion: asString(row.descripcion, "Sin descripcion disponible."),
      categoria: row.categoria ? String(row.categoria) : undefined,
      fecha_creacion: row.fecha_creacion ? String(row.fecha_creacion) : undefined,
      id_galeria_foto: photoId ?? null,
      precio: suggestedPrice,
      estrella: !!row.estrella,
      activo: row.activo !== false,
      id_catalogo: asString(catalog?.id_catalogo) || null,
      id_empresa: companyId || null,
      nombre_empresa: asString(company?.nombre_comercial) || null,
      nit_empresa: asString(company?.nit) || null,
      precio_sugerido: suggestedPrice,
      costo_produccion: asNullableNumber(catalog?.costo_produccion),
    }
  })
}

export type ProductCompanyOption = {
  id_empresa: string
  nit: string
  nombre_comercial: string
}

export async function fetchProductCompanyOptions(): Promise<ProductCompanyOption[]> {
  const { data, error } = await supabase
    .from(DICTIONARY_TABLES.empresa[0])
    .select("id_empresa, nit, nombre_comercial")
    .order("nombre_comercial", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? [])
    .map((row) => {
      const source = row as Record<string, unknown>
      return {
        id_empresa: asString(source.id_empresa),
        nit: asString(source.nit),
        nombre_comercial: asString(source.nombre_comercial, "Empresa sin nombre"),
      }
    })
    .filter((company) => company.id_empresa)
}

// Inserta un producto derivado creado desde el panel administrativo.
export async function createDerivedProduct(payload: {
  id_producto: string
  nombre_derivado: string
  descripcion: string | null
  categoria: string
}) {
  return supabase.from(DICTIONARY_TABLES.productosDerivados[0]).insert(payload)
}
