"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { MapPin, Users, TreePine, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: MapPin,
    title: "Origen Único",
    description: "Nuestro cacao proviene de las fértiles tierras de la Sierra Nevada de Santa Marta, con su clima tropical húmedo ideal para el cultivo de cacao de excelencia.",
  },
  {
    icon: Users,
    title: "Comercio Justo",
    description: "Trabajamos directamente con más de 500 familias cacaoteras, garantizando precios justos y desarrollo comunitario.",
  },
  {
    icon: TreePine,
    title: "Sostenibilidad",
    description: "Practicamos la agricultura regenerativa, protegiendo la biodiversidad y los ecosistemas de la selva amazónica.",
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
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-forest blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-chocolate blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
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
              "text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-cream mb-6 transition-all duration-700 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <span className="text-balance">Más que Cacao,</span>
            <br />
            <span className="text-forest-light">Una Tradición</span>
          </h2>
          <p 
            className={cn(
              "text-cream/60 max-w-2xl mx-auto text-lg leading-relaxed transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            Desde 1992, hemos dedicado nuestra vida a cultivar el mejor cacao de Colombia, 
            preservando los métodos ancestrales mientras innovamos para el futuro.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
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
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 md:right-6 bg-card p-6 rounded-xl border border-border shadow-2xl max-w-xs">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-forest/20 flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-forest-light" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-cream">2,500+</div>
                  <div className="text-sm text-cream/60">Hectáreas Protegidas</div>
                </div>
              </div>
              <p className="text-sm text-cream/50">
                Comprometidos con la conservación del ecosistema amazónico.
              </p>
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
              <p className="text-cream/80 text-lg leading-relaxed">
                La Sierra Nevada de Santa Marta, una majestuosa cordillera costera en el norte de Colombia, es el hogar ancestral de nuestro cacao. Esta región única, con sus altitudes que van desde el nivel del mar hasta picos de más de 5.700 metros, crea microclimas perfectos para el cultivo de cacao fino de aroma. Sus suelos volcánicos fértiles y la humedad constante de la selva tropical producen granos excepcionales, ricos en sabor y aroma.
              </p>
              <p className="text-cream/80 text-lg leading-relaxed">
                Hoy, su legado continúa. Trabajamos mano a mano con comunidades indígenas 
                y campesinas, preservando sus conocimientos ancestrales mientras les ofrecemos 
                oportunidades de desarrollo sostenible.
              </p>
              <p className="text-cream/80 text-lg leading-relaxed">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-forest/50 transition-all duration-500 group",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-forest/10 flex items-center justify-center mb-4 group-hover:bg-forest/20 transition-colors">
                <feature.icon className="w-7 h-7 text-forest-light" />
              </div>
              <h3 className="text-lg font-semibold text-cream mb-2">
                {feature.title}
              </h3>
              <p className="text-cream/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
