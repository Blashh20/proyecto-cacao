"use client"

import type {
  PaymentMethodItem,
  PaymentSettings,
  PurchaseRow,
  UsuarioProfile,
} from "@/model/profile"

import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

// Consulta el perfil del usuario desde la tabla de usuarios usando id o email.
export async function getProfile(userId: string, userEmail?: string): Promise<UsuarioProfile | null> {
  const fields =
    "id_usuario, numero_identificacion, tipo_identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email, telefono_celular, rol, foto_url"

  const email = userEmail?.trim().toLowerCase()
  const query = supabase.from(DICTIONARY_TABLES.usuario[0]).select(fields).limit(1)

  const result = email
    ? await query.or(`id_usuario.eq.${userId},email.eq.${email}`).maybeSingle<UsuarioProfile>()
    : await query.eq("id_usuario", userId).maybeSingle<UsuarioProfile>()

  if (result.error) return null

  console.log("Profile query result:", result.data)
  return result.data ?? null
}

// Lee la configuracion de pagos guardada para el usuario.
export async function getPaymentSettings(
  userId: string
): Promise<(PaymentSettings & { metodos_json?: string | null }) | null> {
  const { data, error } = await supabase
    .from("configuracion_pagos_usuario")
    .select("metodo_preferido, titular_facturacion, documento_facturacion, metodos_json")
    .eq("usuario_id", userId)
    .maybeSingle<PaymentSettings & { metodos_json?: string | null }>()

  if (error) return null
  return data ?? null
}

function mapPurchaseRow(row: Record<string, unknown>, index: number): PurchaseRow {
  return {
    id: String(row.id_venta ?? index + 1),
    fecha: String(row.fecha_creacion ?? new Date().toISOString()),
    total: Number(row.monto_total ?? 0),
    estado: "registrada",
    items: Number(row.cantidad ?? 0),
  }
}

// Consulta las compras/ventas asociadas al usuario o a sus empresas.
export async function getPurchases(userId: string): Promise<PurchaseRow[]> {
  for (const table of DICTIONARY_TABLES.ventas) {
    const byUser = await supabase
      .from(table)
      .select("id_venta, id_usuario, id_empresa, id_producto, id_region, cantidad, monto_total, fecha_creacion")
      .eq("id_usuario", userId)
      .order("fecha_creacion", { ascending: false })
      .limit(20)

    if (!byUser.error && Array.isArray(byUser.data)) {
      return byUser.data.map(mapPurchaseRow)
    }
  }

  const empresas = await supabase
    .from(DICTIONARY_TABLES.empresa[0])
    .select("id_empresa")
    .eq("id_usuario", userId)

  if (empresas.error || !Array.isArray(empresas.data) || empresas.data.length === 0) {
    return []
  }

  const empresaIds = empresas.data.map((row) => String((row as Record<string, unknown>).id_empresa)).filter(Boolean)
  if (empresaIds.length === 0) return []

  for (const table of DICTIONARY_TABLES.ventas) {
    const result = await supabase
      .from(table)
      .select("id_venta, id_empresa, id_producto, id_region, cantidad, monto_total, fecha_creacion")
      .in("id_empresa", empresaIds)
      .order("fecha_creacion", { ascending: false })
      .limit(20)

    if (!result.error && Array.isArray(result.data)) {
      return result.data.map(mapPurchaseRow)
    }
  }

  return []
}

// Convierte el JSON de metodos de pago en una lista tipada para la UI.
export function parsePaymentMethods(raw: string | null | undefined): PaymentMethodItem[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown

    if (!Array.isArray(parsed)) return []

    return parsed
      .map((entry, index) => {
        const item = entry as Partial<PaymentMethodItem>
        const tipo = item.tipo

        if (
          !tipo ||
          !["credito", "debito", "nequi", "daviplata", "transferencia", "efectivo"].includes(tipo)
        ) {
          return null
        }

        return {
          id: String(item.id ?? index + 1),
          tipo,
          alias: String(item.alias ?? "Metodo de pago"),
          ultimos4: String(item.ultimos4 ?? ""),
          principal: Boolean(item.principal),
        } satisfies PaymentMethodItem
      })
      .filter((item): item is PaymentMethodItem => item !== null)
  } catch {
    return []
  }
}

// Inserta o actualiza los datos maestros del usuario en Supabase.
export async function upsertInUsuarioTables(payload: {
  id_usuario: string
  numero_identificacion: string | null
  primer_nombre: string | null
  segundo_nombre: string | null
  primer_apellido: string | null
  segundo_apellido: string | null
  tipo_identificacion: string | null
  telefono_celular: string | null
  foto_url: string | null
  email: string
  rol: string
}): Promise<{ ok: boolean; error?: string }> {
  const result = await supabase
    .from(DICTIONARY_TABLES.usuario[0])
    .upsert(payload, { onConflict: "id_usuario" })

  if (!result.error) return { ok: true }

  return {
    ok: false,
    error: result.error.message,
  }
}

// Guarda preferencias y metodos de pago del usuario.
export async function savePaymentSettings(
  userId: string,
  paymentForm: PaymentSettings,
  paymentMethods: PaymentMethodItem[]
) {
  return supabase.from("configuracion_pagos_usuario").upsert({
    usuario_id: userId,
    metodo_preferido: paymentForm.metodo_preferido || null,
    titular_facturacion: paymentForm.titular_facturacion || null,
    documento_facturacion: paymentForm.documento_facturacion || null,
    metodos_json: JSON.stringify(paymentMethods),
    updated_at: new Date().toISOString(),
  })
}

// Actualiza los metadatos visibles del usuario en Supabase Auth.
export async function updateAuthProfile(fullName: string, avatarUrl: string | null) {
  return supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  })
}

// Cambia la contrasena del usuario autenticado en Supabase Auth.
export async function updateAuthPassword(password: string) {
  return supabase.auth.updateUser({ password })
}
