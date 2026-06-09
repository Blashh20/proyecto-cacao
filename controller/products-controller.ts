"use client"

import { useEffect, useState, useCallback } from "react"

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
        .select("id_catalogo, id_producto, precio_unitario")
        .in("id_producto", productIds)
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? supabase
        .from(DICTIONARY_TABLES.vinculoGaleria[0])
        .select("*")
        .eq("entidad_tipo", "PRODUCTO")
      : Promise.resolve({ data: [], error: null }),
  ])

  const priceByProductId = new Map<string, number>()
  console.log("Catalog data:", catalogRes.data);
  if (!catalogRes.error && Array.isArray(catalogRes.data)) {
    for (const row of catalogRes.data as Record<string, unknown>[]) {
      const productId = asString(row.id_producto)
      if (productId && !priceByProductId.has(productId)) {
        priceByProductId.set(productId, asNumber(row.precio_unitario, 0))
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

    return {
      id_producto: productId,
      nombre_derivado: asString(row.nombre_derivado, "Producto sin nombre"),
      imagen_url: imageUrl ?? getProductImageUrl(row.imagen_url ?? row.url_foto),
      tag: asString(row.categoria, "Makakaw"),
      rating: 4.8,
      descripcion: asString(row.descripcion, "Sin descripción disponible."),
      categoria: row.categoria ? String(row.categoria) : undefined,
      fecha_creacion: row.fecha_creacion ? String(row.fecha_creacion) : undefined,
      id_galeria_foto: photoId ?? null,
      precio: priceByProductId.get(productId) ?? null,
      estrella: !!row.estrella,
      activo: row.activo !== false,
    }
  })
}

// 📦 HOOK REESCRITO PARA SER REAL-TIME Y REAVIVAR LA INTERFAZ
export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)

  // Función envuelta en useCallback para refrescar la data de Supabase a demanda
  const handleRefresh = useCallback(async () => {
    try {
      const items = await fetchProducts()
      setProducts(items)
    } catch (error) {
      console.error("Error cargando productos:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 1. Carga inicial de datos al montar la vista
  useEffect(() => {
    handleRefresh()
  }, [handleRefresh])

  // 2. ⚡ ESCUCHADORES DE EVENTOS GLOBALES PARA ACTUALIZACIÓN INMEDIATA
  useEffect(() => {
    // Al escuchar estos eventos, la lista se actualiza automáticamente en segundo plano
    window.addEventListener("product-saved", handleRefresh)
    window.addEventListener("product-mutated", handleRefresh)

    return () => {
      window.removeEventListener("product-saved", handleRefresh)
      window.removeEventListener("product-mutated", handleRefresh)
    };
  }, [handleRefresh])

  // Retornamos también handleRefresh y loading por si los necesitas en la UI
  return { products, loading, handleRefresh }
}