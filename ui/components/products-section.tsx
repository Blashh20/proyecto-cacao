"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";

import { useProducts } from "@/controller/products-controller";
import { cn } from "@/ui/utils";

export function ProductsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const { products } = useProducts();

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
      className="relative overflow-hidden py-20 md:py-32"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mb-14 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              className={cn(
                "mb-4 inline-block text-sm uppercase tracking-[0.3em] text-forest-light transition-all duration-700",
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              Portafolio Makakaw
            </span>
            <h2
              className={cn(
                "text-3xl font-serif font-bold text-cream transition-all duration-700 delay-100 sm:text-4xl md:text-5xl lg:text-6xl",
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0",
              )}
            >
              <span className="text-balance">Cafe y cacao con</span>
              <br />
              <span className="text-forest-light">identidad de origen</span>
            </h2>
          </div>
          <a
            href="#contacto"
            className={cn(
              "group inline-flex items-center gap-2 self-start text-forest-light transition-all hover:text-cream md:self-auto",
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
            )}
          >
            <span className="text-sm uppercase tracking-wider">
              Solicitar catalogo
            </span>
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.id_producto}
                className={cn(
                  "group relative transition-all duration-700",
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0",
                )}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
                onMouseEnter={() => setHoveredProduct(product.id_producto)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:border-forest/50">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.imagen_url || "/public/apple-icon.png"}
                      alt={product.nombre_derivado}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-700",
                        hoveredProduct === product.id_producto
                          ? "scale-110"
                          : "scale-100",
                      )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                    <span className="absolute left-3 top-3 rounded-full bg-forest px-3 py-1 text-[11px] uppercase tracking-wider text-cream sm:left-4 sm:top-4 sm:text-xs">
                      {product.tag}
                    </span>

                    <button
                      className={cn(
                        "absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-forest text-cream transition-all duration-500 sm:bottom-4 sm:right-4 sm:h-12 sm:w-12",
                        hoveredProduct === product.id_producto
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0 sm:opacity-0",
                        hoveredProduct !== product.id_producto
                          ? "opacity-100 sm:opacity-0"
                          : "",
                      )}
                    >
                      <ShoppingBag size={20} />
                    </button>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-2 flex items-center gap-1">
                      <Star size={14} className="fill-gold text-gold" />
                      <span className="text-sm text-cream/70">
                        {product.rating}
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-cream transition-colors group-hover:text-forest-light">
                      {product.nombre_derivado}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-cream/50 line-clamp-2">
                      {product.descripcion}
                    </p>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xl font-bold text-forest-light">
                        {new Intl.NumberFormat("es-CO").format(product.precio ?? 0)}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-cream/40">
                        COP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-cream/60">
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
            Makakaw integra cafe y cacao en un portafolio con enfoque en
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
