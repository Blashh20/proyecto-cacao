"use client"

import { useEffect, useState } from "react"

import type { ProductItem } from "@/model/products"
import { supabase } from "@/services/client"

export async function fetchProducts(): Promise<ProductItem[]> {
  const { data, error } = await supabase.rpc("obtener_produ")
  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row, index) => ({
    id_producto: String(row.id_producto ?? `prod-${index}`),
    nombre_derivado: String(row.nombre_derivado ?? "Producto sin nombre"),
    imagen_url: String(row.imagen_url),
    tag: String(row.tag ?? row.categoria ?? "Makakaw"),
    rating: Number(row.rating ?? 4.8),
    descripcion: String(row.descripcion ?? row.descripcion_tecnica ?? "Sin descripción disponible."),
    categoria: row.categoria ? String(row.categoria) : undefined,
    fecha_creacion: row.fecha_creacion ? String(row.fecha_creacion) : undefined,
    id_galeria_foto: row.id_galeria_foto ? String(row.id_galeria_foto) : null,
    descripcion_tecnica: row.descripcion_tecnica ? String(row.descripcion_tecnica) : null,
    precio: row.precio == null ? null : Number(row.precio),
  }))
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
