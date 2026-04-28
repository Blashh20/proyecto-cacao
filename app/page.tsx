import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { ProcessSection } from "@/components/process-section"
import { ProjectsMapSection } from "@/components/projects-map-section"
import { ProductsSection } from "@/components/products-section"
import { GallerySection } from "@/components/gallery-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { AdminProjectsPanel } from "@/components/admin-projects-panel"

export default function Home() {
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
