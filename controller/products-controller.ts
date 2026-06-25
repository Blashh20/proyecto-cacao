"use client"

import { useCallback, useEffect, useState } from "react"

import type { ProductItem } from "@/model/products"
import { fetchProducts } from "@/services/products-service"

// Controla el estado de productos en la UI y delega las consultas a services/products-service.
export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    void handleRefresh()
  }, [handleRefresh])

  useEffect(() => {
    window.addEventListener("product-saved", handleRefresh)
    window.addEventListener("product-mutated", handleRefresh)

    return () => {
      window.removeEventListener("product-saved", handleRefresh)
      window.removeEventListener("product-mutated", handleRefresh)
    }
  }, [handleRefresh])

  return { products, loading, handleRefresh }
}
