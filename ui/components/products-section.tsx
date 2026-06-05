"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ShoppingBag,
  MoreVertical,
  Trash2,
  Pencil,
  EyeOff,
  Eye,
  Star,
} from "lucide-react";

import { cn } from "@/ui/utils";
import { supabase } from "@/services/client";
import { useAuth } from "@/controller/auth-controller";

type ProductItem = {
  id_producto: string;
  nombre_derivado: string;
  descripcion: string;
  categoria: string;
  activo: boolean;
  estrella: boolean;
  galeria_fotos: { id_foto: string; url_foto: string } | null;
};

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Load products list from Supabase
  const loadProducts = useCallback(async () => {
    let query = supabase
      .from("productos_derivados")
      .select("id_producto, nombre_derivado, descripcion, categoria, activo, estrella, galeria_fotos(id_foto, url_foto)")
      .order("fecha_creacion", { ascending: false });

    // If not admin, only fetch active products
    if (!isAdmin) {
      query = query.eq("activo", true);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error cargando productos:", error);
    } else {
      const mapped = (data ?? []).map((p: any) => {
        let gf = null;
        if (p.galeria_fotos) {
          gf = Array.isArray(p.galeria_fotos) ? p.galeria_fotos[0] : p.galeria_fotos;
        }
        return {
          id_producto: p.id_producto,
          nombre_derivado: p.nombre_derivado,
          descripcion: p.descripcion,
          categoria: p.categoria,
          activo: p.activo,
          estrella: p.estrella,
          galeria_fotos: gf,
        };
      });
      setProducts(mapped);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    loadProducts();

    if (sectionRef.current) observer.observe(sectionRef.current);

    // Listen to custom event when a product is saved or updated in the admin form
    window.addEventListener("product-saved", loadProducts);

    return () => {
      observer.disconnect();
      window.removeEventListener("product-saved", loadProducts);
    };
  }, [loadProducts]);

  // Close dropdown menu when clicking anywhere else
  useEffect(() => {
    const closeDropdown = () => setOpenMenu(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  /* ---------------------------------------------------------------- */
  /* Actions                                                          */
  /* ---------------------------------------------------------------- */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    const { error } = await supabase
      .from("productos_derivados")
      .delete()
      .eq("id_producto", id);

    if (error) {
      alert(`Error al eliminar el producto: ${error.message}`);
    } else {
      setProducts((prev) => prev.filter((p) => p.id_producto !== id));
    }
    setOpenMenu(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("productos_derivados")
      .update({ activo: !currentStatus })
      .eq("id_producto", id);

    if (error) {
      alert(`Error al cambiar estado del producto: ${error.message}`);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id_producto === id ? { ...p, activo: !currentStatus } : p))
      );
    }
    setOpenMenu(null);
  };

  const handleToggleStar = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("productos_derivados")
      .update({ estrella: !currentStatus })
      .eq("id_producto", id);

    if (error) {
      alert(`Error al destacar el producto: ${error.message}`);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id_producto === id ? { ...p, estrella: !currentStatus } : p))
      );
    }
    setOpenMenu(null);
  };

  const handleEdit = (product: ProductItem) => {
    window.dispatchEvent(new CustomEvent("edit-product", { detail: product }));
    setOpenMenu(null);
  };

  return (
    <section
      id="productos"
      ref={sectionRef}
      className="relative overflow-hidden py-20 md:py-32 bg-[#1C130D]"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="mb-14 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              className={cn(
                "mb-4 inline-block text-sm uppercase tracking-[0.3em] text-forest-light transition-all duration-700",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              Portafolio Makakaw
            </span>
            <h2
              className={cn(
                "text-3xl font-serif font-bold text-cream transition-all duration-700 delay-100 sm:text-4xl md:text-5xl lg:text-6xl",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
              )}
            >
              <span className="text-balance">Café y cacao con</span>
              <br />
              <span className="text-forest-light">identidad de origen</span>
            </h2>
          </div>
          <a
            href="#contacto"
            className={cn(
              "group inline-flex items-center gap-2 self-start text-forest-light transition-all hover:text-cream md:self-auto",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <span className="text-sm uppercase tracking-wider">Solicitar catálogo</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Products Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card">
                <div className="aspect-square rounded-t-2xl bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/3 rounded bg-muted" />
                  <div className="h-5 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => {
              const isDeactivated = !product.activo;
              const isStarred = product.estrella;

              return (
                <div
                  key={product.id_producto}
                  className={cn(
                    "group relative transition-all duration-700",
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
                    isDeactivated && isAdmin ? "opacity-75" : "opacity-100"
                  )}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl border bg-card transition-all duration-500",
                      isStarred
                        ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] bg-amber-950/10"
                        : "border-border hover:border-forest/50",
                    )}
                  >
                    {/* Contenedor de la Imagen */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.galeria_fotos?.url_foto || "/images/cacao-beans.jpg"}
                        alt={product.nombre_derivado ?? "Producto"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Sombra degradada inferior */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

                      {/* REQUERIMIENTO: Sombra encima si está desactivado */}
                      {isDeactivated && isAdmin && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[1px] z-10">
                          <span className="bg-red-950/90 border border-red-500/50 text-red-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg">
                            Oculto al Público
                          </span>
                        </div>
                      )}

                      {/* REQUERIMIENTO: Estrella en la esquina */}
                      {isStarred && (
                        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-950 p-1.5 rounded-full shadow-lg z-20 animate-pulse">
                          <Star size={16} className="fill-yellow-950 text-yellow-950" />
                        </div>
                      )}

                      {/* Categoría Badge */}
                      {product.categoria && (
                        <span className="absolute left-3 top-3 rounded-full bg-forest px-3 py-1 text-[11px] uppercase tracking-wider text-cream z-20">
                          {product.categoria}
                        </span>
                      )}

                      {/* REQUERIMIENTO: Botón de tres puntos */}
                      {isAdmin && (
                        <div className="absolute right-3 top-3 z-30">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === product.id_producto ? null : product.id_producto);
                            }}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-cream hover:bg-black/90 transition-all shadow-md border border-white/10",
                              isStarred && "mr-9"
                            )}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Opciones del Dropdown */}
                          {openMenu === product.id_producto && (
                            <div
                              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-[#1A120B] shadow-2xl z-40"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleEdit(product)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-semibold text-cream/90 transition hover:bg-forest/30 hover:text-white"
                              >
                                <Pencil size={14} className="text-forest-light" />
                                Actualizar Datos
                              </button>

                              <button
                                onClick={() => handleToggleStar(product.id_producto, isStarred)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-semibold text-cream/90 transition hover:bg-yellow-400/20 hover:text-yellow-400"
                              >
                                <Star size={14} className={isStarred ? "fill-yellow-400 text-yellow-400" : "text-yellow-400/60"} />
                                {isStarred ? "Quitar Destacado" : "Destacar Producto"}
                              </button>

                              <button
                                onClick={() => handleToggleActive(product.id_producto, product.activo)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-semibold text-cream/90 transition hover:bg-orange-500/20 hover:text-orange-400"
                              >
                                {product.activo ? <EyeOff size={14} className="text-orange-400" /> : <Eye size={14} className="text-green-400" />}
                                {product.activo ? "Ocultar / Desactivar" : "Mostrar / Activar"}
                              </button>

                              <button
                                onClick={() => handleDelete(product.id_producto)}
                                className="flex w-full items-center gap-2.5 px-4 py-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 border-t border-white/5"
                              >
                                <Trash2 size={14} />
                                Eliminar Producto
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botón de añadir al carrito (Solo vista pública) */}
                      {!isAdmin && (
                        <button className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream transition-all duration-500 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 sm:h-12 sm:w-12">
                          <ShoppingBag size={20} />
                        </button>
                      )}
                    </div>

                    {/* Sección de Texto/Contenido (Corregido dentro del scope del map) */}
                    <div className="p-5 sm:p-6">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-forest-light tracking-wide">
                        <span>{product.categoria ?? "Portafolio"}</span>
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-cream transition-colors group-hover:text-forest-light">
                        {product.nombre_derivado}
                      </h3>
                      <p className="text-sm leading-relaxed text-cream/50 line-clamp-3">
                        {product.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-cream/60 py-12">
              No hay productos disponibles en este momento.
            </p>
          )}
        </div>

        {/* Sales CTA */}
        <div
          className={cn(
            "mt-14 text-center transition-all duration-700 delay-700 md:mt-16",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
          )}
        >
          <p className="mx-auto mb-6 max-w-xl text-cream/60">
            Makakaw integra café y cacao en un portafolio con enfoque en
            calidad, trazabilidad y relaciones comerciales de largo plazo.
          </p>
          <a
            href="#contacto"
            className="inline-flex items-center gap-3 rounded-full bg-forest px-6 py-4 font-medium text-cream transition-all hover:scale-105 hover:bg-forest-light hover:shadow-lg hover:shadow-forest/30 sm:px-8"
          >
            <ShoppingBag size={20} />
            <span className="text-sm uppercase tracking-wider">
              Hablar con ventas
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}