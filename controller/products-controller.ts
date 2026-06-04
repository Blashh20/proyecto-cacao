"use client"

import { useEffect, useState } from "react"

import type { ProductItem } from "@/model/products"
import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

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

export async function fetchProducts(): Promise<ProductItem[]> {
  const productsRes = await supabase
    .from(DICTIONARY_TABLES.productosDerivados[0])
    .select("id_producto, nombre_derivado, categoria, descripcion_tecnica, fecha_creacion")
    .order("fecha_creacion", { ascending: false })

  if (productsRes.error || !Array.isArray(productsRes.data)) {
    throw new Error(productsRes.error?.message ?? "No se pudieron consultar productos_derivados")
  }

  const productIds = productsRes.data.map((row) => asString(row.id_producto)).filter(Boolean)
  const [catalogRes, linksRes] = await Promise.all([
    productIds.length > 0
      ? supabase
          .from(DICTIONARY_TABLES.catalogoEmpresa[0])
          .select("id_catalogo, id_producto, precio_sugerido, costo_produccion")
          .in("id_producto", productIds)
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? supabase
          .from(DICTIONARY_TABLES.vinculoGaleria[0])
          .select("id_vinculo, id_foto, entidad_tipo, id_empresa")
          .eq("entidad_tipo", "PRODUCTO")
          .in("id_empresa", productIds)
      : Promise.resolve({ data: [], error: null }),
  ])


  const priceByProductId = new Map<string, number>()
  if (!catalogRes.error && Array.isArray(catalogRes.data)) {
    for (const row of catalogRes.data as Record<string, unknown>[]) {
      const productId = asString(row.id_producto)
      if (productId && !priceByProductId.has(productId)) {
        priceByProductId.set(productId, asNumber(row.precio_sugerido, 0))
      }
    }
  }

  const photoIdByProductId = new Map<string, string>()
  if (!linksRes.error && Array.isArray(linksRes.data)) {
    for (const row of linksRes.data as Record<string, unknown>[]) {
      const productId = asString(row.id_empresa)
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
        const url = asString(row.url_foto)
        if (photoId && url) imageByPhotoId.set(photoId, url)
      }
    }
  }

  return productsRes.data.map((row, index) => {
    const productId = asString(row.id_producto, `prod-${index}`)
    const photoId = photoIdByProductId.get(productId)

    return {
      id_producto: productId,
      nombre_derivado: asString(row.nombre_derivado, "Producto sin nombre"),
      imagen_url: imageByPhotoId.get(photoId ?? "") ?? "/images/cacao-beans.jpg",
      tag: asString(row.categoria, "Makakaw"),
      rating: 4.8,
      descripcion: asString(row.descripcion_tecnica, "Sin descripción disponible."),
      categoria: row.categoria ? String(row.categoria) : undefined,
      fecha_creacion: row.fecha_creacion ? String(row.fecha_creacion) : undefined,
      id_galeria_foto: photoId ?? null,
      descripcion_tecnica: row.descripcion_tecnica ? String(row.descripcion_tecnica) : null,
      precio: priceByProductId.get(productId) ?? null,
    }
  })
}

export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const items = await fetchProducts()
        setProducts(items)
      } catch {
        setProducts([])
      }
    }

    void loadProducts()
  }, [])

  return { products }
}
