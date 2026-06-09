"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShoppingBag, Star, MoreVertical, Edit2, Trash2, EyeOff, Eye } from "lucide-react";

import { useProducts } from "@/controller/products-controller";
import { cn } from "@/ui/utils";
import { supabase } from "../../services/client"; // ✅ Ruta relativa corregida apuntando a tu cliente real

interface ProductoDerivado {
  id_producto: string;
  nombre_derivado: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  tag: string;
  rating: number;
  activo?: boolean;
  estrella?: boolean;
}

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Traemos los productos y la función de refresco del controlador
  const { products, handleRefresh } = useProducts() as {
    products: ProductoDerivado[];
    handleRefresh: () => void;
  };

  const isAdmin = true; // TODO: Vincular con tu AuthController global o sesión de Supabase

  // Estado local para excluir definitivamente de la vista los productos borrados físicamente o por FK
  const [idsEliminadosLocales, setIdsEliminadosLocales] = useState<string[]>([]);

  // 🔄 Reactividad instantánea para inserciones desde otros formularios (como admin-products-panel)
  useEffect(() => {
    const triggerRefresh = () => {
      if (handleRefresh) handleRefresh();
    };

    window.addEventListener("product-saved", triggerRefresh);
    window.addEventListener("product-mutated", triggerRefresh);

    return () => {
      window.removeEventListener("product-saved", triggerRefresh);
      window.removeEventListener("product-mutated", triggerRefresh);
    };
  }, [handleRefresh]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="productos"
      ref={sectionRef}
      className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
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
                "text-3xl font-serif font-bold text-cream transition-all duration-700 delay-100 sm:text-4xl lg:text-5xl",
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
            <span className="text-sm uppercase tracking-wider">
              Solicitar catálogo
            </span>
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>

        {/* CONTENEDOR DE LA GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {products && products.length > 0 ? (
            products
              // 1. Eliminamos duplicados o registros vacíos indeseados filtrando por ID único válido
              .filter((product) => product.id_producto && !idsEliminadosLocales.includes(product.id_producto))
              .map((product, index) => {
                // Si el producto está desactivado en la DB y el usuario no es admin, no se muestra nada
                if (product.activo === false && !isAdmin) return null;

                return (
                  <ProductCard
                    key={`prod-${product.id_producto}-${index}`} // ✅ Key combinada súper segura para evitar renders estáticos duplicados
                    product={product}
                    index={index}
                    isVisible={isVisible}
                    isAdmin={isAdmin}
                    onForceHide={(id) => setIdsEliminadosLocales((prev) => [...prev, id])}
                    onRefreshList={handleRefresh}
                  />
                );
              })
          ) : (
            <p className="col-span-full text-center text-cream/60 py-10">
              No hay productos disponibles en este momento.
            </p>
          )}
        </div>

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

// =======================================================================
// 📦 SUB-COMPONENTE CON ESTADOS REACTIVOS INTERNOS INSTANTÁNEOS
// =======================================================================
function ProductCard({
  product,
  index,
  isVisible,
  isAdmin,
  onForceHide,
  onRefreshList
}: {
  product: ProductoDerivado;
  index: number;
  isVisible: boolean;
  isAdmin: boolean;
  onForceHide: (id: string) => void;
  onRefreshList: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardMenuRef = useRef<HTMLDivElement>(null);

  // ⚡ Estados locales internos clonados del objeto inicial para respuesta visual inmediata
  const [isEstrella, setIsEstrella] = useState(!!product.estrella);
  const [isActivo, setIsActivo] = useState(product.activo !== false);
  const [imgSrc, setImgSrc] = useState<string>(product.imagen_url || "/images/cacao-beans.jpg");

  // Sincronizar estados locales si cambian las propiedades desde el controlador global
  useEffect(() => {
    setIsEstrella(!!product.estrella);
    setIsActivo(product.activo !== false);
    setImgSrc(product.imagen_url || "/images/cacao-beans.jpg");
  }, [product]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (cardMenuRef.current && !cardMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // 🌟 Destacar u opacar producto estrella (Inmediato)
  const toggleEstrella = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);

    const nuevoEstadoEstrella = !isEstrella;
    // Cambio optimista en la interfaz local al instante
    setIsEstrella(nuevoEstadoEstrella);

    const { error } = await supabase
      .from("productos_derivados")
      .update({ estrella: nuevoEstadoEstrella })
      .eq("id_producto", product.id_producto);

    if (!error) {
      onRefreshList(); // Notifica al controlador en segundo plano
    } else {
      console.error("Error al actualizar estrella:", error.message);
      setIsEstrella(!nuevoEstadoEstrella); // Revertimos si falla
    }
  };

  // 👁️ Ocultar o Mostrar rápido en tienda (Inmediato)
  const toggleActivo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);

    const nuevoEstadoActivo = !isActivo;
    // Cambio optimista en la interfaz local al instante
    setIsActivo(nuevoEstadoActivo);

    const { error } = await supabase
      .from("productos_derivados")
      .update({ activo: nuevoEstadoActivo })
      .eq("id_producto", product.id_producto);

    if (!error) {
      onRefreshList();
    } else {
      console.error("Error al actualizar estado activo:", error.message);
      setIsActivo(!nuevoEstadoActivo); // Revertimos si falla
    }
  };

  // 🗑️ Eliminar definitivo con desvanecimiento inmediato total
  const handleEliminar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);

    if (!confirm(`¿Estás seguro de que deseas eliminar definitivamente "${product.nombre_derivado}"?`)) {
      return;
    }

    // Desaparece del DOM local al milisegundo exacto para que no se vea el "fantasma" estático
    onForceHide(product.id_producto);

    // Ejecutamos la petición asíncrona hacia Supabase en segundo plano
    const { error: deleteError } = await supabase
      .from("productos_derivados")
      .delete()
      .eq("id_producto", product.id_producto);

    if (deleteError) {
      // Si falla por llaves foráneas en cascada (ventas/catálogos anteriores), hacemos soft-delete invisible
      if (deleteError.code === "23503" || deleteError.message.includes("violates foreign key")) {
        await supabase
          .from("productos_derivados")
          .update({ activo: false })
          .eq("id_producto", product.id_producto);
      } else {
        console.error("Error al eliminar de la base de datos:", deleteError.message);
      }
    }

    onRefreshList();
    window.dispatchEvent(new CustomEvent("product-mutated"));
  };

  const handleActualizar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    window.dispatchEvent(new CustomEvent("edit-product", { detail: product }));
  };

  return (
    <div
      className={cn(
        "group relative transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0",
      )}
      style={{ transitionDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-card transition-all duration-500 hover:border-forest/50 relative h-full flex flex-col justify-between",
          isEstrella ? "border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]" : "border-border"
        )}
      >
        {/* Capa visual si está oculto (Inactivado) */}
        {!isActivo && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-[2px] flex items-center justify-center border border-dashed border-red-500/20 rounded-2xl">
            <span className="bg-red-500 text-white font-semibold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <EyeOff size={13} /> Oculto en Tienda
            </span>
          </div>
        )}

        {/* Badge de Destacado */}
        {isEstrella && (
          <div className="absolute top-3 left-3 z-20 bg-amber-400 text-neutral-900 p-1.5 rounded-full shadow-md animate-in zoom-in-50 duration-300">
            <Star size={12} fill="currentColor" className="text-neutral-950" />
          </div>
        )}

        {/* Menú flotante de acciones del Administrador */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-30" ref={cardMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/90 border border-border text-cream hover:bg-muted transition shadow-sm"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-xl border border-border bg-card p-1 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <button
                  type="button"
                  onClick={toggleEstrella}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left hover:bg-muted transition text-amber-400 font-medium"
                >
                  <Star size={14} fill={isEstrella ? "currentColor" : "none"} />
                  {isEstrella ? "Quitar Destacado" : "Destacar Producto"}
                </button>
                <button
                  type="button"
                  onClick={handleActualizar}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left hover:bg-muted transition text-cream"
                >
                  <Edit2 size={14} /> Editar campos
                </button>
                <button
                  type="button"
                  onClick={toggleActivo}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left hover:bg-muted transition text-cream"
                >
                  {isActivo ? (
                    <>
                      <EyeOff size={14} /> Oculto en Tienda
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Mostrar en Tienda
                    </>
                  )}
                </button>
                <hr className="my-1 border-border" />
                <button
                  type="button"
                  onClick={handleEliminar}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-left hover:bg-red-500/10 text-red-400 font-medium transition"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sección de la Imagen */}
        <div className="relative aspect-square overflow-hidden w-full bg-muted/10">
          <img
            src={imgSrc}
            alt={product.nombre_derivado}
            loading="lazy"
            decoding="async"
            onError={() => {
              if (imgSrc !== "/images/cacao-beans.jpg") {
                setImgSrc("/images/cacao-beans.jpg");
              }
            }}
            className={cn(
              "h-full w-full object-cover transition-transform duration-700",
              isHovered ? "scale-110" : "scale-100",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <span className="absolute left-3 bottom-3 rounded-full bg-forest px-3 py-1 text-[11px] uppercase tracking-wider text-cream sm:text-sm">
            {product.tag || "Portafolio"}
          </span>
        </div>

        {/* Detalles e Información del Producto */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center gap-1">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-base text-cream/70">
                {product.rating || "4.8"}
              </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-cream transition-colors group-hover:text-forest-light">
              {product.nombre_derivado}
            </h3>
            <p className="mb-4 text-base leading-relaxed text-cream/50 line-clamp-2">
              {product.descripcion}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 mt-auto">
            <span className="text-xl font-bold text-forest-light">
              {new Intl.NumberFormat("es-CO").format(product.precio ?? 0)}
            </span>
            <span className="text-sm uppercase tracking-wider text-cream/40">
              COP/UNIDAD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}