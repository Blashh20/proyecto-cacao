

import { Header } from "@/ui/components/header"
import { HeroSection } from "@/ui/components/hero-section"
import { AboutSection } from "@/ui/components/about-section"
import { ProcessSection } from "@/ui/components/process-section"
import { ProjectsMapSection } from "@/ui/components/projects-map-section"
import { TourismSection } from "@/ui/components/tourism-section"
import { ProductsSection } from "@/ui/components/products-section"
import { GallerySection } from "@/ui/components/gallery-section"
import { ContactSection } from "@/ui/components/contact-section"
import { Footer } from "@/ui/components/footer"
import { AdminProjectsPanel } from "@/ui/components/admin-projects-panel"
import { AdminProductsPanel } from "@/ui/components/admin-products-panel"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <ProjectsMapSection />
      <TourismSection />
      <AdminProjectsPanel />
      <AdminProductsPanel />
      <ProductsSection />
      <GallerySection />
      <ContactSection />
      <Footer />
    </main>
  )
}
