/* eslint-disable @typescript-eslint/no-explicit-any */
import { Header } from "@/ui/components/header"
import { Footer } from "@/ui/components/footer"
import { AdminPageContent } from "@/ui/components/admin-page-content"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <AdminPageContent className="pt-24" />
      <Footer />
    </main>
  )
}
