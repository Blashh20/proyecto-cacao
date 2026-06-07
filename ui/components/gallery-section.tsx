"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

import { cn } from "@/ui/utils"

const galleryImages = [
  {
    src: "/images/hero-jungle.jpg",
    alt: "Selva amazonica colombiana",
    mobileSpan: "col-span-2 row-span-1",
    desktopSpan: "md:col-span-2 md:row-span-2",
  },
  {
    src: "/images/cacao-pods.jpg",
    alt: "Mazorcas de cacao",
    mobileSpan: "col-span-1 row-span-1",
    desktopSpan: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/images/plantation.jpg",
    alt: "Plantacion de cacao",
    mobileSpan: "col-span-1 row-span-1",
    desktopSpan: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/images/fermentation.jpg",
    alt: "Proceso de fermentacion",
    mobileSpan: "col-span-2 row-span-1",
    desktopSpan: "md:col-span-1 md:row-span-2",
  },
  {
    src: "/images/cacao-beans.jpg",
    alt: "Granos de cacao secandose",
    mobileSpan: "col-span-1 row-span-1",
    desktopSpan: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/images/chocolate-artisan.jpg",
    alt: "Chocolate artesanal",
    mobileSpan: "col-span-1 row-span-1",
    desktopSpan: "md:col-span-1 md:row-span-1",
  },
]

export function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

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

  useEffect(() => {
    if (selectedImage !== null) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedImage])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-card/30 py-14 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center md:mb-12">
          <span
            className={cn(
              "mb-4 inline-block text-sm uppercase tracking-[0.3em] text-forest-light transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            Galeria
          </span>
          <h2
            className={cn(
              "mb-4 text-3xl font-serif font-bold text-cream transition-all duration-700 delay-100 sm:text-4xl lg:text-5xl",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <span className="text-balance">Momentos del</span>
            <br />
            <span className="text-forest-light">Cacao</span>
          </h2>
        </div>

        <div className="grid auto-rows-[120px] grid-cols-2 gap-3 sm:auto-rows-[160px] md:grid-cols-4 md:auto-rows-[210px] md:gap-4">
          {galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-700",
                image.mobileSpan,
                image.desktopSpan,
                isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              )}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <Image src={image.src} alt={image.alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="rounded-full border border-cream/50 px-4 py-2 text-sm uppercase tracking-wider text-cream">
                  Ver
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-lg sm:p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-4 top-4 text-cream/70 transition-colors hover:text-cream sm:right-6 sm:top-6"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="relative aspect-video max-h-[75vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={galleryImages[selectedImage].src} alt={galleryImages[selectedImage].alt} fill className="object-contain" />
          </div>
          <p className="absolute bottom-6 left-1/2 w-[90%] -translate-x-1/2 text-center text-sm text-cream/60 sm:bottom-8">
            {galleryImages[selectedImage].alt}
          </p>
        </div>
      )}
    </section>
  )
}

