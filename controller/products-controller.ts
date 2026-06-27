"use client";

import { useCallback, useEffect, useState } from "react";

import type { ProductItem } from "@/model/products";
import { consultarProductos} from "@/services/products-service";

// Controla el estado de productos en la UI y delega las consultas a services/products-service.
export function Consultar_Products() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleRefresh = useCallback(async () => {
    try {
      const items = await consultarProductos();
      // Map API response shape to ProductItem[] expected by the UI
      const mapped: ProductItem[] = items.map((item) => ({
        nit: item.empresas?.[0]?.nit,
        nombre_comercial: item.empresas?.[0]?.nombre_comercial ?? "",

        id_producto: item.productos_derivados?.[0]?.id_producto,
        nombre_derivado: item.productos_derivados?.[0]?.nombre_derivado,
        descripcion: item.productos_derivados?.[0]?.descripcion,
        categoria: item.productos_derivados?.[0]?.categoria,

        imagen_url: item.productos_derivados?.[0]?.galeria_fotos?.[0].url_foto,
        id_foto: item.productos_derivados?.[0]?.galeria_fotos?.[0].id_foto,

        precio_unitario: item.precio_unitario,
        costo_produccion: item.costo_produccion,

        tag: item.productos_derivados?.[0]?.categoria,
        activo: item.productos_derivados?.[0]?.activo,
      }));
      setProducts(mapped as ProductItem[]);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    window.addEventListener("product-saved", handleRefresh);
    window.addEventListener("product-mutated", handleRefresh);

    return () => {
      window.removeEventListener("product-saved", handleRefresh);
      window.removeEventListener("product-mutated", handleRefresh);
    };
  }, [handleRefresh]);

  return { products, loading, handleRefresh };
}
