

import { Header } from "@/ui/components/header"
import { HeroSection } from "@/ui/components/hero-section"
import { AboutSection } from "@/ui/components/about-section"
import { ProcessSection } from "@/ui/components/process-section"
import { ProjectsMapSection } from "@/ui/components/projects-map-section"
import { ProductsSection } from "@/ui/components/products-section"
import { GallerySection } from "@/ui/components/gallery-section"
import { ContactSection } from "@/ui/components/contact-section"
import { Footer } from "@/ui/components/footer"
import { AdminProjectsPanel } from "@/ui/components/admin-projects-panel"
import { supabase } from "@/services/client"

export default async function Home() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")

  if (error) {
    console.error("Error:", error)
  } else {
    console.log("Usuarios:", data)
  }

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <ProjectsMapSection />
      <AdminProjectsPanel />
      <ProductsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </main>
  )
}