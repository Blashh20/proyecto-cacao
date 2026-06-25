"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { MapPin, Users, TreePine, Sparkles } from "lucide-react"
import { cn } from "@/ui/utils"

const features = [
  {
    icon: MapPin,
    title: "Origen Único",
    description: "Nuestro cacao proviene de las fértiles y mágicas tierras de la región Chimila, en el departamento del Cesar, con un clima cálido ideal para un cultivo de excelencia.",
  },
  {
    icon: Users,
    title: "Comercio Justo",
    description: "Trabajamos directamente con más de 500 familias cacaoteras, garantizando precios justos y desarrollo comunitario.",
  },
  {
    icon: TreePine,
    title: "Sostenibilidad",
    description: "Practicamos la agricultura regenerativa, protegiendo la rica biodiversidad y los valiosos ecosistemas de la región del Cesar.",
  },
  {
    icon: Sparkles,
    title: "Calidad Premium",
    description: "Cada grano es seleccionado a mano y procesado con métodos artesanales transmitidos por generaciones.",
  },
]

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="nosotros"
      ref={sectionRef}
      className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-forest blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-chocolate blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center lg:mb-12">
          <span 
            className={cn(
              "inline-block text-forest-light text-sm tracking-[0.3em] uppercase mb-4 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Nuestra Historia
          </span>
          <h2 
            className={cn(
              "mb-4 text-3xl font-serif font-bold text-cream transition-all duration-700 delay-100 sm:text-4xl lg:text-5xl",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-balance">Más que Cacao,</span>
            <br />
            <span className="text-forest-light">Una Tradición</span>
          </h2>
          <p 
            className={cn(
              "mx-auto max-w-2xl text-base leading-relaxed text-cream/60 transition-all duration-700 delay-200 sm:text-lg",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            Desde 1992, hemos dedicado nuestra vida a cultivar el mejor cacao de Colombia, 
            preservando los métodos ancestrales mientras innovamos para el futuro.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="mb-12 grid items-center gap-10 lg:mb-14 lg:grid-cols-2 lg:gap-14">
          {/* Image Column */}
          <div 
            className={cn(
              "relative transition-all duration-1000 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            )}
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="/images/plantation.jpg"
                alt="Plantación de cacao en Colombia"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Text Column */}
          <div 
            className={cn(
              "transition-all duration-1000 delay-500",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            )}
          >
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-cream/80 sm:text-lg">
                La ancestral región de los Chimilas, enclavada en el corazón del departamento del Cesar, es el hogar sagrado de nuestro cacao. Esta tierra privilegiada, bañada por ríos y bendecida con el sol ardiente del Caribe colombiano, crea el entorno perfecto para el cultivo de cacao fino de aroma. La riqueza mineral de sus valles y el amor de su gente producen granos robustos y excepcionales, impregnados de notas de sabor profundas y un aroma absolutamente inconfundible.
              </p>
              <p className="text-base leading-relaxed text-cream/80 sm:text-lg">
                Hoy, su legado continúa. Trabajamos mano a mano con comunidades indígenas 
                y campesinas, preservando sus conocimientos ancestrales mientras les ofrecemos 
                oportunidades de desarrollo sostenible.
              </p>
              <p className="text-base leading-relaxed text-cream/80 sm:text-lg">
                Cada grano de cacao que producimos cuenta una historia de <strong className="text-forest-light">pasión, 
                dedicación y respeto</strong> por nuestra tierra colombiana.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-forest-light font-serif italic text-xl mb-2">
                {'"El cacao es el alma de nuestra tierra"'}
              </p>
              <p className="text-cream/60 text-sm">
                — José Martínez, Fundador
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm transition-all duration-500 hover:border-forest/50 sm:p-5",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 transition-colors group-hover:bg-forest/20">
                <feature.icon className="w-7 h-7 text-forest-light" />
              </div>
              <h3 className="text-lg font-semibold text-cream mb-2">
                {feature.title}
              </h3>
              <p className="text-cream/70 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

