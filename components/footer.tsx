"use client"

import Link from "next/link"
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
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-14 sm:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="#inicio" className="mb-6 flex items-start gap-3 sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-cream" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
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
