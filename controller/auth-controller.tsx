"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Provider, User as SupabaseUser } from "@supabase/supabase-js"

import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

interface LoginInput {
  email: string
  password: string
  role: "admin" | "user"
}

interface RegisterInput {
  tipo_identificacion: string
  numero_identificacion: string
  primer_nombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
  email: string
  telefono_celular: string
  password: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  loginWithProvider: (provider: Provider) => Promise<void>
  logout: () => Promise<void>
  register: (input: RegisterInput) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface UsuarioRow {
  id_usuario: string
  tipo_identificacion: string | null
  primer_nombre: string | null
  segundo_nombre: string | null
  primer_apellido: string | null
  segundo_apellido: string | null
  email: string | null
  telefono_celular: string | null
  rol: string | null
}

function getAdminEmails() {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? ""
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function normalizeRole(roleValue: string | null | undefined): "admin" | "user" {
  const normalized = roleValue?.trim().toLowerCase() ?? ""
  return normalized === "admin" || normalized === "administrador" || normalized === "superadministrador" ? "admin" : "user"
}

function getRoleFromSupabaseUser(user: SupabaseUser): "admin" | "user" {
  const metadataRole = user.user_metadata?.role ?? user.app_metadata?.role

  if (normalizeRole(String(metadataRole)) === "admin") {
    return "admin"
  }

  const email = (user.email ?? "").toLowerCase()
  const adminEmails = getAdminEmails()

  if (email && adminEmails.includes(email)) {
    return "admin"
  }

  return "user"
}

function buildNameFromUsuario(profile: UsuarioRow | null, fallbackName: string) {
  if (!profile) return fallbackName

  const parts = [
    profile.primer_nombre,
    profile.segundo_nombre,
    profile.primer_apellido,
    profile.segundo_apellido,
  ]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)

  if (parts.length === 0) return fallbackName

  return parts.join(" ")
}

async function getUsuarioProfile(id: string) {
  const fields = "id, tipo_identificacion, numero_identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email, telefono_celular, rol"

  const firstTry = await supabase
    .from("usuario")
    .select(fields)
    .eq("id", id)
    .maybeSingle<UsuarioRow>()

  if (firstTry.data) {
    return firstTry.data
  }

  const secondTry = await supabase
    .from("Usuarios")
    .select(fields)
    .eq("id", id)
    .maybeSingle<UsuarioRow>()

  if (secondTry.data) {
    return secondTry.data
  }

  return null
}

async function mapSupabaseUser(user: SupabaseUser): Promise<User> {
  const email = user.email ?? ""
  const fallbackName = email.includes("@") ? email.split("@")[0] : "Usuario"
  const metadataName = user.user_metadata?.name ?? user.user_metadata?.full_name
  const fallbackFromMetadata = typeof metadataName === "string" && metadataName.trim().length > 0 ? metadataName : fallbackName
  const profile = await getUsuarioProfile(user.id)
  const roleFromProfile = normalizeRole(profile?.rol)

  return {
    id: profile?.id_usuario ?? String(user.user_metadata?.numero_identificacion ?? user.user_metadata?.id_usuario ?? user.id),
    email: profile?.email ?? email,
    name: buildNameFromUsuario(profile, fallbackFromMetadata),
    role: roleFromProfile === "admin" ? "admin" : getRoleFromSupabaseUser(user),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const syncSessionUser = async (sessionUser: SupabaseUser | null) => {
      if (!isMounted) return

      if (!sessionUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const mappedUser = await mapSupabaseUser(sessionUser)

      if (!isMounted) return
      setUser(mappedUser)
      setIsLoading(false)
    }

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      await syncSessionUser(data.session?.user ?? null)
    }

    void loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSessionUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async ({ email, password, role }: LoginInput) => {
    const normalizedEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (error) {
      throw new Error("Correo o contrasena incorrectos")
    }

    const sessionUser = data.user
    if (!sessionUser) {
      throw new Error("No se pudo iniciar sesion")
    }

    const mappedUser = await mapSupabaseUser(sessionUser)
    const resolvedRole = mappedUser.role

    if (role === "admin" && resolvedRole !== "admin") {
      await supabase.auth.signOut()
      throw new Error("Tu cuenta no tiene permisos de administrador")
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error("No se pudo cerrar sesion")
    }
  }

  const loginWithProvider = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    })

    if (error) {
      throw new Error(`No se pudo iniciar sesion con ${provider}`)
    }
  }

  const register = async ({
    tipo_identificacion,
    numero_identificacion,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    email,
    telefono_celular,
    password,
  }: RegisterInput) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPrimerNombre = primer_nombre.trim()
    const normalizedSegundoNombre = segundo_nombre.trim()
    const normalizedPrimerApellido = primer_apellido.trim()
    const normalizedSegundoApellido = segundo_apellido.trim()
    const normalizedTelefono = telefono_celular.trim()
    const normalizedTipo = tipo_identificacion.trim()
    const normalizedNumero = numero_identificacion.trim()

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: [normalizedPrimerNombre, normalizedPrimerApellido].filter(Boolean).join(" "),
          tipo_identificacion: normalizedTipo,
          numero_identificacion: normalizedNumero,
          primer_nombre: normalizedPrimerNombre,
          segundo_nombre: normalizedSegundoNombre || null,
          primer_apellido: normalizedPrimerApellido,
          segundo_apellido: normalizedSegundoApellido || null,
          telefono_celular: normalizedTelefono,
          id_usuario: normalizedNumero,
          role: "Cliente",
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    const createdUser = data.user
    if (!createdUser) {
      throw new Error("No se pudo crear el usuario en autenticacion")
    }

    const profilePayload = {
      id_usuario: normalizedNumero,
      tipo_identificacion: normalizedTipo || null,
      primer_nombre: normalizedPrimerNombre,
      segundo_nombre: normalizedSegundoNombre || null,
      primer_apellido: normalizedPrimerApellido,
      segundo_apellido: normalizedSegundoApellido || null,
      email: normalizedEmail,
      telefono_celular: normalizedTelefono || null,
      rol: "Cliente",
    }

    const profileTables = DICTIONARY_TABLES.usuario
    let lastProfileError: string | null = null
    let inserted = false

    for (const table of profileTables) {
      const { error: profileError } = await supabase.from(table).insert(profilePayload)
      if (!profileError) {
        inserted = true
        break
      }
      lastProfileError = `${table}: ${profileError.message}`
    }

    if (!inserted) {
      throw new Error(
        `Usuario auth creado, pero fallo inserción del perfil. Revisa nombre de tabla/permisos RLS. Último error: ${lastProfileError ?? "desconocido"}`
      )
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithProvider,
      logout,
      register,
    }),
    [isLoading, user]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
