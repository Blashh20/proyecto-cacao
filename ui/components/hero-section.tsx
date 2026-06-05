"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Award, ChevronDown, Globe, Heart, Leaf, Mountain, Truck } from "lucide-react"

import { cn } from "@/ui/utils"
  
const stats = [
  { icon: Leaf, value: "100%", label: "Origen responsable" },
  { icon: Award, value: "30+", label: "Anos de experiencia" },
  { icon: Heart, value: "500+", label: "Familias productoras" },
  { icon: Mountain, value: "2,500+", label: "Hectareas articuladas" },
  { icon: Globe, value: "6", label: "Alianzas activas" },
  { icon: Truck, value: "24h", label: "Respuesta comercial" },
]

const summaryItems = [
  {
    title: "Cafe",
    description: "Portafolio con identidad de origen, perfiles diferenciados y enfoque comercial.",
  },
  {
    title: "Cacao",
    description: "Seleccion de cacao premium para productos, derivados y oportunidades B2B.",
  },
  {
    title: "Impacto",
    description: "Relacion directa con productores, trazabilidad y crecimiento sostenible.",
  },
]

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="inicio" className="relative flex min-h-[calc(100svh-72px)] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <Image
          src="/images/hero-jungle.jpg"
          alt="Paisaje colombiano de origen para cafe y cacao"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn("absolute h-2 w-2 rounded-full bg-forest/30", "animate-pulse")}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 container mx-auto px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-32">
        <div className="mx-auto max-w-6xl text-center">
          <div
            className={cn(
              "mb-5 inline-flex items-center gap-2 rounded-full border border-forest/50 bg-forest/10 px-3 py-2 backdrop-blur-sm transition-all duration-1000 sm:mb-6 sm:px-4",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-forest animate-pulse" />
            <span className="text-center text-[11px] uppercase tracking-[0.2em] text-forest-light sm:text-sm sm:tracking-widest">
              Makakaw / Cafe y Cacao Colombiano
            </span>
          </div>

          <h1
            className={cn(
              "mb-5 text-[clamp(2.4rem,8vw,5.5rem)] font-serif font-bold leading-[0.95] text-cream transition-all duration-1000 delay-200",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <span className="block text-balance">Origen</span>
            <span className="block text-forest-light">Calidad</span>
            <span className="block text-balance">Cafe y Cacao</span>
          </h1>

          <p
            className={cn(
              "mx-auto mb-7 max-w-3xl text-sm font-light leading-relaxed text-cream/70 transition-all duration-1000 delay-400 sm:text-base md:mb-9 md:text-xl",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Makakaw es una empresa especializada en cafe y cacao que conecta productores, calidad premium y
            oportunidades comerciales con una vision sostenible de largo plazo.
          </p>

          <div
            className={cn(
              "mb-9 flex flex-col items-stretch justify-center gap-3 transition-all duration-1000 delay-500 sm:flex-row sm:items-center md:mb-11",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <a
              href="#productos"
              className="rounded-full bg-forest px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-cream transition-all hover:scale-105 hover:bg-forest-light hover:shadow-lg hover:shadow-forest/30 sm:px-7 sm:text-sm"
            >
              Ver Portafolio
            </a>
            <a
              href="#nosotros"
              className="rounded-full border border-cream/30 px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-cream transition-all hover:border-forest hover:text-forest-light sm:px-7 sm:text-sm"
            >
              Conocer Makakaw
            </a>
          </div>

          <div
            className={cn(
              "mx-auto mb-6 grid max-w-5xl grid-cols-2 gap-3 transition-all duration-1000 delay-700 sm:grid-cols-3 lg:grid-cols-6",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-cream/10 bg-background/30 px-3 py-4 text-center backdrop-blur-sm sm:px-4"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-forest/20 transition-colors group-hover:bg-forest/30">
                  <stat.icon className="h-5 w-5 text-forest-light" />
                </div>
                <div className="mb-1 text-lg font-bold text-cream sm:text-xl md:text-2xl">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-cream/60 sm:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "mx-auto max-w-4xl rounded-3xl border border-forest/20 bg-background/35 px-4 py-5 backdrop-blur-md transition-all duration-1000 delay-[850ms] sm:px-6",
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <div className="grid gap-4 text-left sm:grid-cols-3">
              {summaryItems.map((item) => (
                <div key={item.title}>
                  <p className="mb-1 text-xs uppercase tracking-[0.25em] text-forest-light">{item.title}</p>
                  <p className="text-sm leading-relaxed text-cream/75">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 animate-bounce sm:block">
        <a href="#nosotros" className="flex flex-col items-center gap-2 text-cream/50 transition-colors hover:text-forest-light">
          <span className="text-xs uppercase tracking-widest">Explorar</span>
          <ChevronDown size={20} />
        </a>
      </div>
    </section>
  )
}
