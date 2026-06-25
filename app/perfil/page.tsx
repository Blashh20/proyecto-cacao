/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import NextLink from "next/link"
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import type { RealtimeChannel } from "@supabase/supabase-js"

import { useAuth } from "@/controller/auth-controller"
import { useProjects } from "@/controller/projects-controller"
import {
  getPaymentSettings,
  getProfile,
  getPurchases,
  parsePaymentMethods,
  savePaymentSettings,
  updateAuthPassword,
  updateAuthProfile,
  upsertInUsuarioTables,
} from "@/controller/profile-controller"
import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"
import type { PaymentMethodItem, PaymentSettings, PurchaseRow, Tab, UsuarioProfile } from "@/model/profile"
import { ProfileHero } from "@/ui/components/dashboard/profile-hero"
import { SummaryTab } from "@/ui/components/dashboard/summary-tab"
import { PurchasesTab } from "@/ui/components/dashboard/purchases-tab"
import { ProjectSubmissionTab } from "@/ui/components/dashboard/project-submission-tab"
import { ProfileFormTab } from "@/ui/components/dashboard/profile-form-tab"
import { SecurityTab } from "@/ui/components/dashboard/security-tab"

const tabs: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Inicio" },
  { id: "compras", label: "Ventas" },
  { id: "proyecto", label: "Proyecto" },
  { id: "perfil", label: "Informacion" },
]

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

function Link({ href, className, children }: Props) {
  return (
    <NextLink href={href} className={className}>
      {children}
    </NextLink>
  );
}

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { projects, addProject } = useProjects()
  const [activeTab, setActiveTab] = useState<Tab>("resumen")
  const [profile, setProfile] = useState<UsuarioProfile | null>(null)
  const [purchases, setPurchases] = useState<PurchaseRow[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  const [profileForm, setProfileForm] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    tipo_identificacion: "",
    numero_identificacion: "",
    telefono_celular: "",
    foto_url: "",
  })
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>({
    metodo_preferido: "",
    titular_facturacion: "",
    documento_facturacion: "",
  })
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const [securityForm, setSecurityForm] = useState({ password: "", confirm: "" })
  const [projectForm, setProjectForm] = useState({
    name: "",
    department: "",
    municipality: "",
    lat: "10.4631",
    lng: "-73.2532",
    localType: "Finca",
    description: "",
    hectares: "",
    families: "",
    yearStarted: String(new Date().getFullYear()),
    production: "",
    variety: "",
    image: "/images/cacao-pods.jpg",
  })

  useEffect(() => {
    const subs: RealtimeChannel[] = []

    const subscribeToProfile = (profileId: string) => {
      for (const table of DICTIONARY_TABLES.usuario) {
        try {
          const channel = supabase
            .channel(`${table}:id_usuario=eq.${profileId}`)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table }, (payload) => {
              const row = payload.new ?? null
              if (!row) return
              const profileRow = row as Partial<UsuarioProfile>
              setProfile((prev) => ({ ...(prev ?? {}), ...profileRow } as UsuarioProfile))
              setProfileForm((s) => ({
                ...s,
                primer_nombre: profileRow.primer_nombre ?? s.primer_nombre,
                segundo_nombre: profileRow.segundo_nombre ?? s.segundo_nombre,
                primer_apellido: profileRow.primer_apellido ?? s.primer_apellido,
                segundo_apellido: profileRow.segundo_apellido ?? s.segundo_apellido,
                tipo_identificacion: profileRow.tipo_identificacion ?? s.tipo_identificacion,
                numero_identificacion: "123",
                telefono_celular: profileRow.telefono_celular ?? s.telefono_celular,
                foto_url: profileRow.foto_url ?? s.foto_url,
              }))
            })
            .subscribe()

          subs.push(channel)
        } catch {
          // ignore subscription errors
        }
      }
    }

    const loadAll = async () => {
      if (!user?.id) {
        setLoadingData(false)
        return
      }

      const loadedProfile = await getProfile(user.id, user.email ?? "")
      const loadedPurchases = await getPurchases(user.id)
      const loadedPayment = await getPaymentSettings(user.id)

      setProfile(loadedProfile)
      setPurchases(loadedPurchases)
      setPaymentForm({
        metodo_preferido: loadedPayment?.metodo_preferido ?? "",
        titular_facturacion: loadedPayment?.titular_facturacion ?? "",
        documento_facturacion: loadedPayment?.documento_facturacion ?? "",
      })
      setPaymentMethods(parsePaymentMethods(loadedPayment?.metodos_json))
      setProfileForm({
        primer_nombre: loadedProfile?.primer_nombre ?? "",
        segundo_nombre: loadedProfile?.segundo_nombre ?? "",
        primer_apellido: loadedProfile?.primer_apellido ?? "",
        segundo_apellido: loadedProfile?.segundo_apellido ?? "",
        tipo_identificacion: loadedProfile?.tipo_identificacion ?? "",
        numero_identificacion: loadedProfile?.numero_identificacion ?? loadedProfile?.id_usuario ?? "",
        telefono_celular: loadedProfile?.telefono_celular ?? "",
        foto_url: loadedProfile?.foto_url ?? "",
      })

      subscribeToProfile(loadedProfile?.id_usuario ?? user.id)
      setLoadingData(false)
    }

    void loadAll()

    return () => {
      for (const s of subs) {
        try {
          s.unsubscribe?.()
        } catch {}
      }
    }
  }, [user?.email, user?.id])

  const stats = useMemo(() => {
    const totalCompras = purchases.length
    const totalGastado = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
    const pendientes = purchases.filter((purchase) => !["entregado", "completed", "pagado"].includes(purchase.estado.toLowerCase())).length
    const ticketPromedio = totalCompras > 0 ? Math.round(totalGastado / totalCompras) : 0
    return { totalCompras, totalGastado, pendientes, ticketPromedio }
  }, [purchases])

  const profileCompletion = useMemo(() => {
    const checks = [
      profileForm.primer_nombre,
      profileForm.primer_apellido,
      profileForm.tipo_identificacion,
      profileForm.numero_identificacion,
      profileForm.telefono_celular,
      profileForm.foto_url,
    ]
    const completed = checks.filter((value) => value && value.trim().length > 0).length
    return Math.round((completed / checks.length) * 100)
  }, [profileForm])

  const myProjects = useMemo(() => {
    if (!user) return []
    return projects.filter((project) => project.ownerId === user.id || project.ownerEmail === user.email)
  }, [projects, user])

  if (isLoading || loadingData) {
    return null
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-background px-4 py-14 text-foreground sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h1 className="text-2xl font-bold">Debes iniciar sesion</h1>
          <p className="mt-2 text-muted-foreground">Accede con tu cuenta para ver el dashboard de perfil.</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-forest hover:underline">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  const fullName =
    [profile?.primer_nombre, profile?.segundo_nombre, profile?.primer_apellido, profile?.segundo_apellido].filter(Boolean).join(" ").trim() || user.name
  const avatarUrl = profile?.foto_url?.trim() || user.avatarUrl || "https://placehold.co/160x160/png?text=Perfil"

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice("")
    setError("")

    const profileId = profile?.id_usuario ?? user.id
    const payload = {
      id_usuario: profileId,
      primer_nombre: profileForm.primer_nombre || null,
      segundo_nombre: profileForm.segundo_nombre || null,
      primer_apellido: profileForm.primer_apellido || null,
      segundo_apellido: profileForm.segundo_apellido || null,
      tipo_identificacion: profileForm.tipo_identificacion || null,
      numero_identificacion: profileForm.numero_identificacion || null,
      telefono_celular: profileForm.telefono_celular || null,
      foto_url: profileForm.foto_url || null,
      email: user.email,
      rol: user.role === "admin" ? "Administrador" : "Cliente",
    }

    const result = await upsertInUsuarioTables(payload)
    if (!result.ok) {
      setError(
        `No se pudo actualizar tu perfil en Supabase. ${result.error ?? "Revisa la tabla Usuario y sus columnas del diccionario."}`
      )
      return
    }

    const authUpdate = await updateAuthProfile(
      [profileForm.primer_nombre, profileForm.primer_apellido].filter(Boolean).join(" "),
      profileForm.foto_url || null
    )

    if (authUpdate.error) {
      setError(`Perfil guardado en base de datos, pero no se actualizo el perfil de auth: ${authUpdate.error.message}`)
      return
    }

    setProfile({
      id_usuario: payload.id_usuario,
      primer_nombre: payload.primer_nombre,
      segundo_nombre: payload.segundo_nombre,
      primer_apellido: payload.primer_apellido,
      segundo_apellido: payload.segundo_apellido,
      tipo_identificacion: payload.tipo_identificacion,
      numero_identificacion: payload.numero_identificacion,
      email: payload.email,
      telefono_celular: payload.telefono_celular,
      rol: payload.rol,
      foto_url: profileForm.foto_url || null,
    })
    setNotice("Perfil actualizado correctamente.")
  }

  const savePayments = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice("")
    setError("")

    const { error: paymentError } = await savePaymentSettings(user.id, paymentForm, paymentMethods)

    if (paymentError) {
      setError("No se pudo guardar pagos. Ese módulo es auxiliar y no está en el diccionario de datos.")
      return
    }

    setNotice("Configuracion de pagos guardada.")
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice("")
    setError("")

    if (securityForm.password.length < 8) {
      setError("La nueva contrasena debe tener minimo 8 caracteres.")
      return
    }
    if (securityForm.password !== securityForm.confirm) {
      setError("Las contrasenas no coinciden.")
      return
    }

    const { error: passwordError } = await updateAuthPassword(securityForm.password)
    if (passwordError) {
      setError(`No se pudo cambiar la contrasena: ${passwordError.message}`)
      return
    }

    setSecurityForm({ password: "", confirm: "" })
    setNotice("Contrasena actualizada con exito.")
  }

  const submitProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice("")
    setError("")

    if (!projectForm.name.trim() || !projectForm.department || !projectForm.municipality || !projectForm.description.trim()) {
      setError("Completa nombre, departamento, municipio y descripcion del proyecto.")
      return
    }

    const location = `${projectForm.municipality}, ${projectForm.department}`

    await addProject({
      name: projectForm.name.trim(),
      location,
      lat: Number(projectForm.lat) || 10.4631,
      lng: Number(projectForm.lng) || -73.2532,
      localType: projectForm.localType,
      description: projectForm.description.trim(),
      hectares: Number(projectForm.hectares) || 0,
      families: Number(projectForm.families) || 0,
      yearStarted: Number(projectForm.yearStarted) || new Date().getFullYear(),
      production: projectForm.production.trim() || "Pendiente por validar",
      variety: projectForm.variety.trim() || "Pendiente por validar",
      image: projectForm.image || "/images/cacao-pods.jpg",
      status: "Pendiente",
      ownerId: user.id,
      ownerEmail: user.email,
    })

    setProjectForm({
      name: "",
      department: "",
      municipality: "",
      lat: "10.4631",
      lng: "-73.2532",
      localType: "Finca",
      description: "",
      hectares: "",
      families: "",
      yearStarted: String(new Date().getFullYear()),
      production: "",
      variety: "",
      image: "/images/cacao-pods.jpg",
    })
    setNotice("Proyecto enviado para revision. Un administrador podra aprobarlo o rechazarlo.")
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <ProfileHero
          fullName={fullName}
          email={profile?.email || user.email}
          role={user.role.toUpperCase()}
          avatarUrl={avatarUrl}
          foto_url={profile?.foto_url || ""}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        {notice ? <div className="mt-4 rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">{notice}</div> : null}
        {error ? <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

        {activeTab === "resumen" ? (
          <SummaryTab
            profileCompletion={profileCompletion}
            phone={profile?.telefono_celular || "Telefono no registrado"}
            email={profile?.email || user.email}
            totalCompras={stats.totalCompras}
            totalGastado={stats.totalGastado}
            ticketPromedio={stats.ticketPromedio}
            pendientes={stats.pendientes}
            purchases={purchases}
          />
        ) : null}

        {activeTab === "compras" ? <PurchasesTab purchases={purchases} /> : null}
        {activeTab === "proyecto" ? (
          <ProjectSubmissionTab form={projectForm} setForm={setProjectForm} projects={myProjects} onSubmit={submitProject} />
        ) : null}
        {activeTab === "perfil" ? <ProfileFormTab form={profileForm} setForm={setProfileForm} onSubmit={saveProfile} /> : null}
        {activeTab === "seguridad" ? <SecurityTab form={securityForm} setForm={setSecurityForm} onSubmit={changePassword} /> : null}
      </div>
    </main>
  )
}
