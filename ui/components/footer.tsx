"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowUp, Facebook, Instagram, Twitter, Youtube } from "lucide-react"

const footerLinks = {
  productos: [
    { label: "Cafe de Origen", href: "#productos" },
    { label: "Cacao en Polvo", href: "#productos" },
    { label: "Nibs de Cacao", href: "#productos" },
    { label: "Linea Institucional", href: "#productos" },
  ],
  empresa: [
    { label: "Sobre Makakaw", href: "#nosotros" },
    { label: "Proceso", href: "#proceso" },
    { label: "Proyectos", href: "#proyectos" },
    { label: "Contacto", href: "#contacto" },
  ],
  soporte: [
    { label: "Contacto comercial", href: "#contacto" },
    { label: "Preguntas Frecuentes", href: "#" },
    { label: "Envios", href: "#" },
    { label: "Politicas", href: "#" },
  ],
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="border-t border-border bg-black backdrop-blur-sm">
      <div className="container mx-auto px-4 py-14 sm:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="#inicio" className="mb-6 flex items-start gap-3 sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest">
                <Image
                                src="/images/simbolo.png"
                                alt="Logo Makakaw"
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
              </div>
              <div className="min-w-0">
                <span className="block text-lg font-serif font-bold text-cream sm:text-xl">Makakaw</span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-forest-light sm:text-xs sm:tracking-[0.2em]">
                  Cafe y Cacao Colombiano
                </span>
              </div>
            </Link>
            <p className="mb-6 max-w-sm leading-relaxed text-cream/60">
              Makakaw es una empresa especializada en cafe y cacao, enfocada en origen, calidad y relaciones sostenibles con productores y clientes.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-cream/60 transition-colors hover:bg-forest/10 hover:text-forest-light"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">Productos</h4>
            <ul className="space-y-3">
              {footerLinks.productos.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-cream/60 transition-colors hover:text-forest-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-cream/60 transition-colors hover:text-forest-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">Soporte</h4>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-cream/60 transition-colors hover:text-forest-light">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="text-center text-sm text-cream/40 md:text-left">© 2024 Makakaw. Todos los derechos reservados.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:justify-end">
            <Link href="#" className="text-sm text-cream/40 transition-colors hover:text-cream/60">
              Politica de Privacidad
            </Link>
            <Link href="#" className="text-sm text-cream/40 transition-colors hover:text-cream/60">
              Terminos de Uso
            </Link>
            <Link href="#" className="text-sm text-cream/40 transition-colors hover:text-cream/60">
              Equipo de Desarrollo
            </Link>
            <button
              onClick={scrollToTop}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-cream/40 transition-colors hover:border-forest hover:text-forest-light"
              aria-label="Volver arriba"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

