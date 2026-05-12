import type { Metadata } from "next"
import { Playfair_Display, Lato } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"

import { AuthProvider } from "@/controller/auth-controller"
import { ProjectsProvider } from "@/controller/projects-controller"
import "./globals.css"
import "leaflet/dist/leaflet.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Makakaw | Cafe y Cacao Colombiano",
  description:
    "Makakaw es una empresa colombiana especializada en cafe y cacao, con enfoque en origen, sostenibilidad y productos premium.",
  generator: "v0.app",
  keywords: ["makakaw", "cafe", "cacao", "colombia", "origen", "premium"],
  icons: {
    icon: [
      {
        url: "/images/logo_transparente.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/images/logo_transparente.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/logo_transparente.png",
        type: "image/png",
      },
    ],
    apple: "/images/logo_transparente.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${playfair.variable} ${lato.variable} font-sans antialiased`}>
        <AuthProvider>
          <ProjectsProvider>{children}</ProjectsProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
