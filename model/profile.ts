export type Tab = "resumen" | "compras" | "perfil" | "pagos" | "seguridad"

export interface PurchaseRow {
  id: string
  fecha: string
  total: number
  estado: string
  items: number
}

export interface PaymentSettings {
  metodo_preferido: string
  titular_facturacion: string
  documento_facturacion: string
}

export interface PaymentMethodItem {
  id: string
  tipo: "credito" | "debito" | "nequi" | "daviplata" | "transferencia" | "efectivo"
  alias: string
  ultimos4: string
  principal: boolean
}

export interface UsuarioProfile {
  tipo_identificacion: string | null
  numero_identificacion: string | null
  primer_nombre: string | null
  segundo_nombre: string | null
  primer_apellido: string | null
  segundo_apellido: string | null
  email: string | null
  telefono_celular: string | null
  rol: string | null
  foto_perfil_url?: string | null
}

export interface ProfileFormState {
  primer_nombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
  tipo_identificacion: string
  numero_identificacion: string
  telefono_celular: string
  foto_perfil_url: string
}
