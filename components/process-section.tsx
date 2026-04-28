"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

const processSteps = [
  {
    number: "01",
    title: "Seleccion de origen",
    description:
      "Identificamos lotes y territorios con potencial para desarrollar cafe y cacao diferenciados, priorizando calidad, trazabilidad y consistencia.",
    image: "/images/cacao-pods.jpg",
  },
  {
    number: "02",
    title: "Procesamiento",
    description:
      "Acompanamos etapas clave como beneficio, fermentacion, secado y control de humedad para proteger el perfil sensorial de cada producto.",
    image: "/images/fermentation.jpg",
  },
  {
    number: "03",
    title: "Clasificacion",
    description:
      "Evaluamos caracteristicas fisicas y sensoriales para consolidar lotes con atributos comerciales claros y estandares premium.",
    image: "/images/cacao-beans.jpg",
  },
  {
    number: "04",
    title: "Portafolio final",
    description:
      "Convertimos el origen en una propuesta comercial lista para clientes interesados en cafe y cacao con identidad, calidad y valor agregado.",
    image: "/images/chocolate-artisan.jpg",
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

  return (
    <section id="proceso" ref={sectionRef} className="relative overflow-hidden bg-card/30 py-24 md:py-32">
      <div className="absolute inset-0">
        <div className="absolute -left-48 top-1/4 h-96 w-96 rounded-full bg-forest/5 blur-3xl" />
        <div className="absolute -right-48 bottom-1/4 h-96 w-96 rounded-full bg-chocolate/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-16 text-center lg:mb-24">
          <span
            className={cn(
              "mb-4 inline-block text-sm uppercase tracking-[0.3em] text-forest-light transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            Nuestro Proceso
          </span>
          <h2
            className={cn(
              "mb-6 text-4xl font-serif font-bold text-cream transition-all duration-700 delay-100 md:text-5xl lg:text-6xl",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <span className="text-balance">Del Origen</span>
            <br />
            <span className="text-forest-light">Al Producto Final</span>
          </h2>
          <p
            className={cn(
              "mx-auto max-w-2xl text-lg leading-relaxed text-cream/60 transition-all duration-700 delay-200",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Un proceso donde seleccion, transformacion y control de calidad se alinean para ofrecer productos de cafe y cacao con identidad y consistencia.
          </p>
        </div>

        <div className="hidden items-start gap-10 lg:grid lg:grid-cols-2">
          <div className="sticky top-32 space-y-4">
            {processSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={cn(
                  "group w-full rounded-xl border p-6 text-left transition-all duration-500",
                  activeStep === index ? "border-forest bg-forest/10" : "border-border bg-card/30 hover:border-forest/50"
                )}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "text-3xl font-serif font-bold transition-colors",
                      activeStep === index ? "text-forest-light" : "text-cream/30"
                    )}
                  >
                    {step.number}
                  </span>
                  <div>
                    <h3
                      className={cn(
                        "mb-2 text-xl font-semibold transition-colors",
                        activeStep === index ? "text-cream" : "text-cream/70"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={cn(
                        "text-sm leading-relaxed transition-all duration-500",
                        activeStep === index ? "max-h-24 opacity-100 text-cream/70" : "max-h-0 overflow-hidden opacity-0 text-cream/40"
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-2xl transition-all duration-700 lg:max-w-[520px]",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            )}
          >
            {processSteps.map((step, index) => (
              <div
                key={index}
                className={cn("absolute inset-0 transition-opacity duration-700", activeStep === index ? "opacity-100" : "opacity-0")}
              >
                <Image src={step.image} alt={step.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="text-7xl font-serif font-bold text-forest-light opacity-30">{step.number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-12 lg:hidden">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "transition-all duration-700",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              )}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
            >
              <div className="relative mb-6 aspect-video overflow-hidden rounded-xl">
                <Image src={step.image} alt={step.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 text-5xl font-serif font-bold text-forest-light opacity-50">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-cream">{step.title}</h3>
              <p className="leading-relaxed text-cream/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
