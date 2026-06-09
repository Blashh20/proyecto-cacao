"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Leaf, Droplets, Box, Sun, Wind, Settings2, Thermometer, Grid3X3 } from "lucide-react"

import { cn } from "@/ui/utils"

const moments = [
  {
    id: "01",
    title: "Cosecha de Cacao",
    description: "Seleccion cuidadosa de mazorcas maduras a mano, garantizando la mejor calidad.",
    icon: Leaf,
    image: "/images/plantation.jpg",
  },
  {
    id: "02",
    title: "Despulpado",
    description: "Extraccion manual de los granos frescos, separandolos de la cascara con delicadeza.",
    icon: Droplets,
    image: "/images/cacao-pods.jpg",
  },
  {
    id: "03",
    title: "Fermentado",
    description: "Reposo en cajones de madera para desarrollar precursores del aroma y sabor a chocolate.",
    icon: Box,
    image: "/images/fermentation.jpg",
  },
  {
    id: "04",
    title: "Secado al Sol",
    description: "Exposicion natural en marquesinas para reducir la humedad y fijar caracteristicas.",
    icon: Sun,
    image: "/images/cacao-beans.jpg",
  },
  {
    id: "05",
    title: "Descascarillado",
    description: "Remocion de la cascarilla externa para obtener los nibs puros y limpios de cacao.",
    icon: Wind,
    image: "/images/cacao-beans.jpg",
  },
  {
    id: "06",
    title: "Triturado y Conchado",
    description: "Molienda fina y agitacion que suaviza la textura y refina el perfil aromatico.",
    icon: Settings2,
    image: "/images/chocolate-artisan.jpg",
  },
  {
    id: "07",
    title: "Temperado",
    description: "Cambios de temperatura calculados para lograr un chocolate brillante con buen chasquido.",
    icon: Thermometer,
    image: "/images/chocolate-artisan.jpg",
  },
  {
    id: "08",
    title: "Moldeado",
    description: "Vertido final en moldes para dar forma a las tabletas, listas para degustar.",
    icon: Grid3X3,
    image: "/images/chocolate-artisan.jpg",
  },
]

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrollPosition = -rect.top + window.innerHeight / 2
      const stepHeight = rect.height / moments.length
      
      let current = Math.floor(scrollPosition / stepHeight)
      if (current < 0) current = 0
      if (current >= moments.length) current = moments.length - 1
      
      setActiveStep(current)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // initial check
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-background py-20 lg:py-32">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-0 top-1/4 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-forest/5 blur-[120px]" />
        <div className="absolute right-0 top-2/3 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-amber-700/5 blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6">
        <div className="mb-20 text-center">
          <span className="mb-4 inline-block text-sm uppercase tracking-[0.3em] text-forest-light">
            Paso a Paso
          </span>
          <h2 className="mb-4 text-4xl font-serif font-bold text-cream sm:text-5xl lg:text-6xl">
            <span className="text-balance">Momentos del</span>
            <br />
            <span className="italic text-forest-light">Cacao</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-cream/60">
            El arte de transformar el fruto sagrado en chocolate excepcional.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Central Line (Desktop) */}
          <div className="absolute left-8 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute left-8 top-0 w-1 bg-gradient-to-b from-forest-light to-amber-500 shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all duration-700 md:left-1/2 md:-translate-x-1/2"
            style={{ height: `${(activeStep / (moments.length - 1)) * 100}%` }}
          />

          <div className="space-y-16 pb-24 md:space-y-24">
            {moments.map((moment, index) => {
              const isActive = index <= activeStep
              const isCurrentlyActive = index === activeStep
              const isEven = index % 2 === 0

              return (
                <div key={moment.id} className="relative flex items-center md:justify-between">
                  
                  {/* Left Side (Empty on Mobile, Alternates Image/Text on Desktop) */}
                  <div className={cn(
                    "hidden w-1/2 pr-16 text-right md:block transition-all duration-1000",
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                  )}>
                    {isEven ? (
                      // Text on the left
                      <>
                        <h3 className="mb-2 text-3xl font-serif font-bold text-cream">{moment.title}</h3>
                        <p className="text-lg leading-relaxed text-cream/70">{moment.description}</p>
                      </>
                    ) : (
                      // Image on the left
                      <div className="relative ml-auto aspect-video w-[80%] overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50">
                        <Image src={moment.image} alt={moment.title} fill className="object-cover transition-transform duration-1000 hover:scale-110" />
                      </div>
                    )}
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-8 z-10 -translate-x-1/2 md:static md:translate-x-0">
                    <div className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all duration-700",
                      isActive 
                        ? "border-forest-light bg-card shadow-[0_0_30px_rgba(74,222,128,0.2)] scale-110" 
                        : "border-border bg-background scale-100",
                      isCurrentlyActive && "ring-4 ring-forest/20 ring-offset-4 ring-offset-background"
                    )}>
                      <moment.icon className={cn(
                        "h-6 w-6 transition-colors duration-700",
                        isActive ? "text-forest-light" : "text-muted-foreground"
                      )} />
                    </div>
                  </div>

                  {/* Right Side (Content on Mobile, Alternates Image/Text on Desktop) */}
                  <div className={cn(
                    "ml-24 w-full md:ml-0 md:w-1/2 md:pl-16 transition-all duration-1000",
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                  )}>
                    {/* Mobile View: Text + Image combined */}
                    <div className="md:hidden">
                      <span className="mb-1 block text-sm font-bold tracking-widest text-forest-light">PASO {moment.id}</span>
                      <h3 className="mb-2 text-2xl font-serif font-bold text-cream">{moment.title}</h3>
                      <div className="relative mb-4 mt-3 aspect-video w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-border/50">
                        <Image src={moment.image} alt={moment.title} fill className="object-cover" />
                      </div>
                      <p className="text-base leading-relaxed text-cream/70">{moment.description}</p>
                    </div>
                    
                    {/* Desktop View */}
                    <div className="hidden md:block text-left">
                      {!isEven ? (
                        // Text on the right
                        <>
                          <h3 className="mb-2 text-3xl font-serif font-bold text-cream">{moment.title}</h3>
                          <p className="text-lg leading-relaxed text-cream/70">{moment.description}</p>
                        </>
                      ) : (
                        // Image on the right
                        <div className="relative mr-auto aspect-video w-[80%] overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50">
                          <Image src={moment.image} alt={moment.title} fill className="object-cover transition-transform duration-1000 hover:scale-110" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Step Number Hint */}
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-8xl font-serif font-black transition-all duration-1000 pointer-events-none",
                    isEven ? "md:right-[15%] right-4" : "md:left-[15%] right-4",
                    isActive ? "text-forest/5 scale-100" : "text-transparent scale-50"
                  )}>
                    {moment.id}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}


