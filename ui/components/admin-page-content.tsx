"use client"

import { Shield } from "lucide-react"
import { useAuth } from "@/controller/auth-controller"
import { AdminProjectsPanel } from "@/ui/components/admin-projects-panel"
import { cn } from "@/ui/utils"

interface AdminPageContentProps {
  className?: string
  showUnauthorized?: boolean
}

export function AdminPageContent({ className, showUnauthorized = true }: AdminPageContentProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || user?.role !== "admin") {
    if (!showUnauthorized) {
      return null
    }

    return (
      <section className="min-h-[70vh] px-4 pb-16 pt-32 sm:px-6">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl rounded-3xl bg-card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/10 text-forest-light">
              <Shield size={26} />
            </div>
            <h1 className="mt-5 text-3xl font-serif font-bold text-foreground">Administracion</h1>
            <p className="mt-3 text-muted-foreground">
              Inicia sesion con una cuenta administradora para gestionar proyectos, productos e indicadores internos.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className={cn(className)}>
      <AdminProjectsPanel />
    </div>
  )
}
