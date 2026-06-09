"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Sparkles, ArrowRight, Leaf, Sprout, Sun, Droplets } from "lucide-react"

import { cn } from "@/ui/utils"

const processSteps = [
  {
    number: "01",
    title: "Seleccion de origen",
    description:
      "Identificamos lotes y territorios con potencial para desarrollar cafe y cacao diferenciados, priorizando calidad, trazabilidad y consistencia.",
    icon: Leaf,
    images: ["/images/cacao-pods.jpg", "/images/plantation.jpg", "/images/hero-jungle.jpg"],
    color: "from-forest/40 to-forest/5",
  },
  {
    number: "02",
    title: "Procesamiento",
    description:
      "Acompanamos etapas clave como beneficio, fermentacion, secado y control de humedad para proteger el perfil sensorial de cada producto.",
    icon: Droplets,
    images: ["/images/fermentation.jpg", "/images/cacao-pods.jpg", "/images/cacao-beans.jpg"],
    color: "from-amber-600/40 to-amber-600/5",
  },
  {
    number: "03",
    title: "Clasificacion",
    description:
      "Evaluamos caracteristicas fisicas y sensoriales para consolidar lotes con atributos comerciales claros y estandares premium.",
    icon: Sun,
    images: ["/images/cacao-beans.jpg", "/images/chocolate-artisan.jpg", "/images/fermentation.jpg"],
    color: "from-orange-600/40 to-orange-600/5",
  },
  {
    number: "04",
    title: "Portafolio final",
    description:
      "Convertimos el origen en una propuesta comercial lista para clientes interesados en cafe y cacao con identidad, calidad y valor agregado.",
    icon: Sprout,
    images: ["/images/chocolate-artisan.jpg", "/images/hero-jungle.jpg", "/images/plantation.jpg"],
    color: "from-chocolate/40 to-chocolate/5",
  },
]

export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Auto-cycle through steps if user hasn't clicked recently
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % processSteps.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const activeData = processSteps[activeStep]

  return (
    <section id="proceso" ref={sectionRef} className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
      {/* Dynamic Background Elements based on active step */}
      <div className="absolute inset-0 transition-colors duration-1000 ease-in-out">
        <div className={cn("absolute -left-48 top-0 h-[600px] w-[600px] rounded-full blur-[120px] transition-all duration-1000", activeData.color, "opacity-30")} />
        <div className={cn("absolute -right-48 bottom-0 h-[600px] w-[600px] rounded-full blur-[120px] transition-all duration-1000", activeData.color, "opacity-20")} />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mb-16 text-center lg:mb-24">
          <div className={cn(
              "mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-forest/20 text-forest-light backdrop-blur-sm transition-all duration-700",
              isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}>
            <Sparkles size={24} />
          </div>
          <h2
            className={cn(
              "mb-6 text-4xl font-serif font-bold text-cream transition-all duration-700 delay-100 sm:text-5xl lg:text-6xl drop-shadow-sm",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Nuestra <span className="text-forest-light italic">Maestria</span>
          </h2>
          <p
            className={cn(
              "mx-auto max-w-2xl text-lg leading-relaxed text-cream/80 transition-all duration-700 delay-200 sm:text-xl",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Un viaje de los sentidos: seleccionamos meticulosamente y transformamos la esencia pura de la naturaleza en productos premium.
          </p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
          {/* Left Side: Interactive List */}
          <div className="flex-1 space-y-6">
            {processSteps.map((step, index) => {
              const isActive = activeStep === index
              const Icon = step.icon

              return (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-2xl border p-6 text-left transition-all duration-500",
                    isActive
                      ? "border-forest/50 bg-forest/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                      : "border-border/50 bg-card/10 hover:border-forest/30 hover:bg-card/20"
                  )}
                >
                  {/* Progress bar effect on active */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-forest/20">
                      <div className="h-full bg-forest animate-[progress_6s_linear_infinite]" />
                    </div>
                  )}

                  <div className="flex items-start gap-5">
                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-500",
                      isActive ? "bg-forest text-cream shadow-lg shadow-forest/20 scale-110" : "bg-card/30 text-cream/40 group-hover:bg-card/50"
                    )}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-sm font-bold tracking-wider transition-colors",
                          isActive ? "text-forest-light" : "text-cream/30"
                        )}>
                          PASO {step.number}
                        </span>
                      </div>
                      <h3
                        className={cn(
                          "mt-1 text-2xl font-serif font-bold transition-colors",
                          isActive ? "text-cream" : "text-cream/70"
                        )}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={cn(
                          "mt-3 text-base leading-relaxed transition-all duration-500",
                          isActive ? "max-h-32 opacity-100 text-cream/80" : "max-h-0 overflow-hidden opacity-0 text-cream/40"
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right Side: Stunning Image Collage */}
          <div className="flex-1 lg:h-[650px] relative mt-10 lg:mt-0">
            <div className={cn(
              "relative h-full w-full min-h-[500px] transition-all duration-1000",
              isVisible ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0"
            )}>
              {/* Central Main Image */}
              <div className="absolute left-1/2 top-1/2 z-20 h-[380px] w-[280px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] shadow-2xl transition-all duration-700 sm:h-[450px] sm:w-[320px] lg:h-[500px] lg:w-[360px]">
                <Image
                  src={activeData.images[0]}
                  alt={`${activeData.title} main`}
                  fill
                  className="object-cover transition-transform duration-[10s] hover:scale-110"
                />
                <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/20" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-6 pt-20">
                  <span className="text-6xl font-serif text-white/20 font-black absolute bottom-4 right-6">{activeData.number}</span>
                </div>
              </div>

              {/* Floating Accent Image 1 */}
              <div className="absolute left-0 top-[10%] z-30 h-40 w-40 -rotate-6 overflow-hidden rounded-2xl border-4 border-background shadow-xl transition-all duration-1000 ease-out sm:h-48 sm:w-48 lg:-left-12 lg:top-[15%]">
                <Image
                  src={activeData.images[1]}
                  alt={`${activeData.title} secondary`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating Accent Image 2 */}
              <div className="absolute bottom-[5%] right-0 z-10 h-48 w-48 rotate-6 overflow-hidden rounded-full border-4 border-background shadow-2xl transition-all duration-1000 ease-out sm:h-56 sm:w-56 lg:-right-8 lg:bottom-[10%]">
                <Image
                  src={activeData.images[2]}
                  alt={`${activeData.title} detail`}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Decorative Circle */}
              <div className="absolute right-[20%] top-[5%] z-0 h-32 w-32 animate-pulse rounded-full border border-forest/30 bg-transparent" />
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </section>
  )
}

