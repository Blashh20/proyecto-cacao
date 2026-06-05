"use client"

import NextLink from "next/link"
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

import { useAuth } from "@/controller/auth-controller"
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
import type { PaymentMethodItem, PaymentSettings, PurchaseRow, Tab, UsuarioProfile } from "@/model/profile"
import {
  ProfileHero,
  ProfileFormTab,
  PurchasesTab,
  SecurityTab,
  SummaryTab,
  PaymentsTab,
} from "@/ui/components/profile/profile-dashboard"

const tabs: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Inicio" },
  { id: "compras", label: "Ventas" },
  { id: "perfil", label: "Informacion" },
  { id: "pagos", label: "Pagos" },
  { id: "seguridad", label: "Seguridad" },
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
    foto_perfil_url: "",
  })
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>({
    metodo_preferido: "",
    titular_facturacion: "",
    documento_facturacion: "",
  })
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([])
  const [securityForm, setSecurityForm] = useState({ password: "", confirm: "" })

  useEffect(() => {
    const loadAll = async () => {
      if (!user?.id) {
        setLoadingData(false)
        return
      }

      const loadedProfile = await getProfile(user.id)
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
        numero_identificacion: loadedProfile?.id_usuario ?? "",
        telefono_celular: loadedProfile?.telefono_celular ?? "",
        foto_perfil_url: loadedProfile?.foto_perfil_url ?? "",
      })
      setLoadingData(false)
    }

    void loadAll()
  }, [user?.id])

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
      profileForm.foto_perfil_url,
    ]
    const completed = checks.filter((value) => value && value.trim().length > 0).length
    return Math.round((completed / checks.length) * 100)
  }, [profileForm])

  if (isLoading || loadingData) {
    return <main className="min-h-screen bg-background px-4 py-24 text-foreground">Cargando dashboard...</main>
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-background px-4 py-24 text-foreground">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8">
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
  const avatarUrl = profile?.foto_perfil_url?.trim() || "https://placehold.co/160x160/png?text=Perfil"

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice("")
    setError("")

    const payload = {
      id_usuario: profileForm.numero_identificacion || user.id,
      primer_nombre: profileForm.primer_nombre || null,
      segundo_nombre: profileForm.segundo_nombre || null,
      primer_apellido: profileForm.primer_apellido || null,
      segundo_apellido: profileForm.segundo_apellido || null,
      tipo_identificacion: profileForm.tipo_identificacion || null,
      telefono_celular: profileForm.telefono_celular || null,
      email: user.email,
      rol: user.role === "admin" ? "Administrador" : "Cliente",
    }

    const result = await upsertInUsuarioTables(payload)
    if (!result.ok) {
      setError("No se pudo actualizar tu perfil en Supabase. Revisa la tabla Usuario y sus columnas del diccionario.")
      return
    }

    await updateAuthProfile(
      [profileForm.primer_nombre, profileForm.primer_apellido].filter(Boolean).join(" "),
      profileForm.foto_perfil_url || null
    )

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

  return (
    <main className="min-h-screen py-12">
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
        {activeTab === "perfil" ? <ProfileFormTab form={profileForm} setForm={setProfileForm} onSubmit={saveProfile} /> : null}
        {activeTab === "pagos" ? (
          <PaymentsTab
            form={paymentForm}
            setForm={setPaymentForm}
            methods={paymentMethods}
            setMethods={setPaymentMethods}
            onSubmit={savePayments}
          />
        ) : null}
        {activeTab === "seguridad" ? <SecurityTab form={securityForm} setForm={setSecurityForm} onSubmit={changePassword} /> : null}
      </div>
    </main>
  )
}
