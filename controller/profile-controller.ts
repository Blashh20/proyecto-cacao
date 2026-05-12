"use client"

import type {
  PaymentMethodItem,
  PaymentSettings,
  PurchaseRow,
  UsuarioProfile,
} from "@/model/profile"
import { supabase } from "@/services/client"

export async function getProfile(userId: string): Promise<UsuarioProfile | null> {
  const fields =
    "tipo_identificacion, numero_identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email, telefono_celular, rol, foto_perfil_url"
  const firstTry = await supabase.from("usuario").select(fields).eq("id", userId).maybeSingle<UsuarioProfile>()
  if (firstTry.data) return firstTry.data

  const secondTry = await supabase.from("Usuarios").select(fields).eq("id", userId).maybeSingle<UsuarioProfile>()
  if (secondTry.data) return secondTry.data

  return null
}

export async function getPurchases(userId: string): Promise<PurchaseRow[]> {
  const tableCandidates = ["compras", "pedidos", "orders", "ordenes"]
  const idFields = ["usuario_id", "user_id", "id_usuario", "customer_id"]

  for (const table of tableCandidates) {
    for (const idField of idFields) {
      const result = await supabase.from(table).select("*").eq(idField, userId).order("created_at", { ascending: false }).limit(20)
      if (!result.error && Array.isArray(result.data)) {
        return result.data.map((row: Record<string, unknown>, index) => ({
          id: String(row.id ?? row.id_compra ?? row.id_pedido ?? index + 1),
          fecha: String(row.created_at ?? row.fecha ?? row.fecha_compra ?? new Date().toISOString()),
          total: Number(row.total ?? row.monto_total ?? row.valor_total ?? 0),
          estado: String(row.estado ?? row.status ?? "pendiente"),
          items: Number(row.items_count ?? row.cantidad_items ?? row.items ?? 0),
        }))
      }
    }
  }
  return []
}

export async function getPaymentSettings(userId: string): Promise<(PaymentSettings & { metodos_json?: string | null }) | null> {
  const { data, error } = await supabase
    .from("configuracion_pagos_usuario")
    .select("metodo_preferido, titular_facturacion, documento_facturacion, metodos_json")
    .eq("usuario_id", userId)
    .maybeSingle<PaymentSettings & { metodos_json?: string | null }>()

  if (error) return null
  return data ?? null
}

export function parsePaymentMethods(raw: string | null | undefined): PaymentMethodItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((entry, index) => {
        const item = entry as Partial<PaymentMethodItem>
        const tipo = item.tipo
        if (!tipo || !["credito", "debito", "nequi", "daviplata", "transferencia", "efectivo"].includes(tipo)) {
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

export async function upsertInUsuarioTables(payload: {
  id: string
  primer_nombre: string | null
  segundo_nombre: string | null
  primer_apellido: string | null
  segundo_apellido: string | null
  tipo_identificacion: string | null
  numero_identificacion: string | null
  telefono_celular: string | null
  email: string
  rol: string
  foto_perfil_url: string | null
}): Promise<{ ok: boolean }> {
  const first = await supabase.from("usuario").upsert(payload, { onConflict: "id" })
  if (!first.error) return { ok: true }

  const second = await supabase.from("Usuarios").upsert(payload, { onConflict: "id" })
  if (!second.error) return { ok: true }

  return { ok: false }
}

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

export async function updateAuthProfile(fullName: string, avatarUrl: string | null) {
  return supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  })
}

export async function updateAuthPassword(password: string) {
  return supabase.auth.updateUser({ password })
}
