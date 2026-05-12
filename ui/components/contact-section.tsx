"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle, Clock, Mail, MapPin, Phone, Send } from "lucide-react"

import { cn } from "@/ui/utils"

const contactInfo = [
  {
    icon: MapPin,
    title: "Ubicacion",
    details: ["Colombia", "Operacion comercial para cafe y cacao"],
  },
  {
    icon: Phone,
    title: "Telefono",
    details: ["+57 (8) 592 1234", "+57 310 555 0123"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@makakaw.co", "comercial@makakaw.co"],
  },
  {
    icon: Clock,
    title: "Horario",
    details: ["Lunes - Viernes: 8am - 6pm", "Sabado: 9am - 2pm"],
  },
]

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormState({ name: "", email: "", phone: "", message: "" })

    setTimeout(() => setIsSubmitted(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormState((prev) => {
      if (name === "phone") {
        const onlyNumbers = value.replace(/[^0-9+]/g, "").replace(/(?!^)\+/g, "")
        return { ...prev, [name]: onlyNumbers }
      }

      return { ...prev, [name]: value }
    })
  }

  return (
    <section id="contacto" ref={sectionRef} className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-forest/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-chocolate/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mb-14 text-center md:mb-16">
          <span
            className={cn(
              "mb-4 inline-block text-sm uppercase tracking-[0.3em] text-forest-light transition-all duration-700",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
          >
            Contactanos
          </span>
          <h2
            className={cn(
              "mb-6 text-3xl font-serif font-bold text-cream transition-all duration-700 delay-100 sm:text-4xl md:text-5xl lg:text-6xl",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            <span className="text-balance">Conecta con</span>
            <br />
            <span className="text-forest-light">Makakaw</span>
          </h2>
          <p
            className={cn(
              "mx-auto max-w-2xl text-base leading-relaxed text-cream/60 transition-all duration-700 delay-200 sm:text-lg",
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}
          >
            Si quieres cotizar, conocer el portafolio o explorar oportunidades en cafe y cacao, estamos listos para ayudarte.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div
            className={cn(
              "transition-all duration-700 delay-300",
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
            )}
          >
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-10">
              {isSubmitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-forest/20">
                    <CheckCircle className="h-8 w-8 text-forest-light" />
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-cream">Mensaje enviado</h3>
                  <p className="text-cream/60">Gracias por contactar a Makakaw. Te responderemos pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm text-cream/70">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-border bg-input px-4 py-3 text-cream placeholder-cream/30 transition-colors focus:border-forest focus:outline-none"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm text-cream/70">
                        Telefono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formState.phone}
                        onChange={handleChange}
                        pattern="^\\+?[0-9]+$"
                        inputMode="numeric"
                        className="w-full rounded-lg border border-border bg-input px-4 py-3 text-cream placeholder-cream/30 transition-colors focus:border-forest focus:outline-none"
                        placeholder="+57 300 000 0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm text-cream/70">
                      Correo electronico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-input px-4 py-3 text-cream placeholder-cream/30 transition-colors focus:border-forest focus:outline-none"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm text-cream/70">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full resize-none rounded-lg border border-border bg-input px-4 py-3 text-cream placeholder-cream/30 transition-colors focus:border-forest focus:outline-none"
                      placeholder="Cuentanos como podemos ayudarte"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-forest px-8 py-4 font-medium text-cream transition-all hover:bg-forest-light hover:shadow-lg hover:shadow-forest/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span className="text-sm uppercase tracking-wider">Enviar mensaje</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div
            className={cn(
              "transition-all duration-700 delay-500",
              isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
            )}
          >
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card/50 p-5 transition-colors hover:border-forest/30 sm:p-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-forest/10 transition-colors group-hover:bg-forest/20">
                    <item.icon className="h-5 w-5 text-forest-light" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-cream">{item.title}</h3>
                    {item.details.map((detail, i) => (
                      <p key={i} className="break-words text-sm text-cream/60">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-8 aspect-video overflow-hidden rounded-xl border border-border bg-card/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 text-center">
                  <MapPin className="mx-auto mb-3 h-12 w-12 text-forest-light" />
                  <p className="text-sm text-cream/60">Makakaw - Colombia</p>
                  <p className="mt-1 text-xs text-cream/40">Especialistas en cafe y cacao</p>
                </div>
              </div>
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

