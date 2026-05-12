"use client"

import { useEffect, useState } from "react"

import type { ProductItem } from "@/model/products"
import { supabase } from "@/services/client"

export async function fetchProducts(): Promise<ProductItem[]> {
  const { data, error } = await supabase.rpc("obtener_productos")

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as ProductItem[]
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
