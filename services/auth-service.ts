import type { Provider, User as SupabaseUser } from "@supabase/supabase-js"

import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

export interface UsuarioRow {
  id_usuario: string
  tipo_identificacion: string | null
  primer_nombre: string | null
  segundo_nombre: string | null
  primer_apellido: string | null
  segundo_apellido: string | null
  email: string | null
  telefono_celular: string | null
  rol: string | null
  foto_url?: string | null
}

export type UsuarioProfilePayload = {
  id_usuario: string
  tipo_identificacion: string | null
  primer_nombre: string | null
  segundo_nombre: string | null
  primer_apellido: string | null
  segundo_apellido: string | null
  email: string
  telefono_celular: string | null
  rol: string
  foto_url?: string | null
}

const USUARIO_FIELDS =
  "id_usuario, tipo_identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email, telefono_celular, rol, foto_url"

// Busca el perfil de usuario por identificacion, id de auth o email.
export async function findUsuarioProfile(user: SupabaseUser) {
  const candidates = [
    String(user.user_metadata?.numero_identificacion ?? ""),
    String(user.user_metadata?.id_usuario ?? ""),
    user.id,
  ].filter(Boolean)

  for (const table of DICTIONARY_TABLES.usuario) {
    for (const id of candidates) {
      const result = await supabase
        .from(table)
        .select(USUARIO_FIELDS)
        .eq("id_usuario", id)
        .maybeSingle<UsuarioRow>()

      if (!result.error && result.data) return result.data
    }
  }

  if (user.email) {
    for (const table of DICTIONARY_TABLES.usuario) {
      const result = await supabase
        .from(table)
        .select(USUARIO_FIELDS)
        .eq("email", user.email.toLowerCase())
        .maybeSingle<UsuarioRow>()

      if (!result.error && result.data) return result.data
    }
  }

  return null
}

// Crea o actualiza el perfil del usuario en la primera tabla compatible del diccionario.
export async function upsertUsuarioProfile(payload: UsuarioProfilePayload) {
  for (const table of DICTIONARY_TABLES.usuario) {
    const result = await supabase
      .from(table)
      .upsert(payload, { onConflict: "id_usuario" })
      .select("*")
      .maybeSingle<UsuarioRow>()

    if (!result.error && result.data) return result.data
  }

  return null
}

// Inserta el perfil inicial despues del registro en Supabase Auth.
export async function insertUsuarioProfile(payload: Omit<UsuarioProfilePayload, "foto_url">) {
  let lastProfileError: string | null = null

  for (const table of DICTIONARY_TABLES.usuario) {
    const { error } = await supabase.from(table).insert(payload)
    if (!error) return { inserted: true, lastProfileError: null }
    lastProfileError = `${table}: ${error.message}`
  }

  return { inserted: false, lastProfileError }
}

// Lee la sesion actual de Supabase Auth.
export function getCurrentSession() {
  return supabase.auth.getSession()
}

// Escucha cambios de autenticacion y devuelve la suscripcion de Supabase.
export function listenToAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
) {
  return supabase.auth.onAuthStateChange(callback)
}

// Inicia sesion con correo y contrasena.
export function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

// Inicia sesion con un proveedor externo.
export function signInWithOAuthProvider(provider: Provider, redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })
}

// Registra un usuario nuevo en Supabase Auth.
export function signUpWithPassword(params: {
  email: string
  password: string
  metadata: Record<string, unknown>
}) {
  return supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: { data: params.metadata },
  })
}

// Cierra la sesion activa.
export function signOutCurrentUser() {
  return supabase.auth.signOut()
}
