"use client"

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Provider, User as SupabaseUser } from "@supabase/supabase-js"

import {
  findUsuarioProfile,
  getCurrentSession,
  insertUsuarioProfile,
  listenToAuthStateChange,
  signInWithOAuthProvider,
  signInWithPassword,
  signOutCurrentUser,
  signUpWithPassword,
  upsertUsuarioProfile,
  type UsuarioRow,
} from "@/services/auth-service"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatarUrl: string | null
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
  loginWithProvider: (provider: Provider, role?: "admin" | "user") => Promise<void>
  logout: () => Promise<void>
  register: (input: RegisterInput) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const ORGANIZATION_EMAIL_DOMAIN = "@unicesar.edu.co"
const PENDING_LOGIN_ROLE_KEY = "makakaw.pendingLoginRole"

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

function isOrganizationEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase().endsWith(ORGANIZATION_EMAIL_DOMAIN)
}

function getRoleFromSupabaseUser(user: SupabaseUser): "admin" | "user" {
  const email = (user.email ?? "").toLowerCase()

  if (!isOrganizationEmail(email)) {
    return "user"
  }

  const metadataRole = user.user_metadata?.role ?? user.app_metadata?.role

  if (normalizeRole(String(metadataRole)) === "admin") {
    return "admin"
  }

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

function splitDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)

  return {
    primer_nombre: parts[0] ?? null,
    segundo_nombre: parts.length > 3 ? parts.slice(1, -2).join(" ") : null,
    primer_apellido: parts.length > 1 ? parts[parts.length - 2] : null,
    segundo_apellido: parts.length > 2 ? parts[parts.length - 1] : null,
  }
}

async function getUsuarioProfile(user: SupabaseUser) {
  return findUsuarioProfile(user)
}

async function ensureUsuarioProfile(user: SupabaseUser, existingProfile: UsuarioRow | null) {
  const email = user.email?.trim().toLowerCase() ?? ""
  const metadataName = user.user_metadata?.full_name ?? user.user_metadata?.name
  const metadataAvatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture
  const displayName =
    typeof metadataName === "string" && metadataName.trim().length > 0
      ? metadataName.trim()
      : email.includes("@")
        ? email.split("@")[0]
        : "Usuario"
  const names = splitDisplayName(displayName)
  const idUsuario = existingProfile?.id_usuario ?? String(user.user_metadata?.numero_identificacion ?? user.user_metadata?.id_usuario ?? user.id)
  const role = getRoleFromSupabaseUser(user) === "admin" ? "Administrador" : "Cliente"

  const payload = {
    id_usuario: idUsuario,
    tipo_identificacion: existingProfile?.tipo_identificacion ?? null,
    primer_nombre: existingProfile?.primer_nombre ?? names.primer_nombre,
    segundo_nombre: existingProfile?.segundo_nombre ?? names.segundo_nombre,
    primer_apellido: existingProfile?.primer_apellido ?? names.primer_apellido,
    segundo_apellido: existingProfile?.segundo_apellido ?? names.segundo_apellido,
    email: existingProfile?.email ?? email,
    telefono_celular: existingProfile?.telefono_celular ?? null,
    rol: existingProfile?.rol ?? role,
    foto_url:
      existingProfile?.foto_url ??
      (typeof metadataAvatar === "string" && metadataAvatar.trim().length > 0 ? metadataAvatar.trim() : null),
  }

  return (await upsertUsuarioProfile(payload)) ?? existingProfile
}

async function mapSupabaseUser(user: SupabaseUser): Promise<User> {
  const email = user.email ?? ""
  const fallbackName = email.includes("@") ? email.split("@")[0] : "Usuario"
  const metadataName = user.user_metadata?.name ?? user.user_metadata?.full_name
  const fallbackFromMetadata = typeof metadataName === "string" && metadataName.trim().length > 0 ? metadataName : fallbackName
  const existingProfile = await getUsuarioProfile(user)
  const profile = await ensureUsuarioProfile(user, existingProfile)
  const roleFromProfile = isOrganizationEmail(email) ? normalizeRole(profile?.rol) : "user"

  return {
    id: profile?.id_usuario ?? String(user.user_metadata?.numero_identificacion ?? user.user_metadata?.id_usuario ?? user.id),
    email: profile?.email ?? email,
    name: buildNameFromUsuario(profile, fallbackFromMetadata),
    role: roleFromProfile === "admin" ? "admin" : getRoleFromSupabaseUser(user),
    avatarUrl:
      profile?.foto_url ??
      (typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ??
      (typeof user.user_metadata?.picture === "string" ? user.user_metadata.picture : null),
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
      const pendingRole =
        typeof window !== "undefined" ? window.localStorage.getItem(PENDING_LOGIN_ROLE_KEY) : null

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(PENDING_LOGIN_ROLE_KEY)
      }

      if (pendingRole === "admin" && mappedUser.role !== "admin") {
        await signOutCurrentUser()
        if (!isMounted) return
        setUser(null)
        setIsLoading(false)
        return
      }

      if (!isMounted) return
      setUser(mappedUser)
      setIsLoading(false)
    }

    const loadSession = async () => {
      const { data, error } = await getCurrentSession()

      if (error) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      await syncSessionUser(data.session?.user ?? null)
    }

    void loadSession()

    const { data: authListener } = listenToAuthStateChange(async (_event, session) => {
      void syncSessionUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const login = async ({ email, password, role }: LoginInput) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (role === "admin" && !isOrganizationEmail(normalizedEmail)) {
      throw new Error(`Para entrar como administrador debes usar una cuenta ${ORGANIZATION_EMAIL_DOMAIN}`)
    }

    const { data, error } = await signInWithPassword(normalizedEmail, password)

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
      await signOutCurrentUser()
      throw new Error(`Tu cuenta ${ORGANIZATION_EMAIL_DOMAIN} no tiene permisos de administrador`)
    }
  }

  const logout = async () => {
    const { error } = await signOutCurrentUser()
    if (error) {
      throw new Error("No se pudo cerrar sesion")
    }
  }

  const loginWithProvider = async (provider: Provider, role: "admin" | "user" = "user") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PENDING_LOGIN_ROLE_KEY, role)
    }

    const { error } = await signInWithOAuthProvider(
      provider,
      typeof window !== "undefined" ? `${window.location.origin}/perfil` : undefined
    )

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

    const { data, error } = await signUpWithPassword({
      email: normalizedEmail,
      password,
      metadata: {
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

    const { inserted, lastProfileError } = await insertUsuarioProfile(profilePayload)

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

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
