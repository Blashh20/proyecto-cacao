export interface ProductItem {
  id_producto: string
  nombre_derivado: string
  imagen_url: string
  tag: string
  rating: number
  descripcion: string
  categoria?: string
  fecha_creacion?: string
  id_galeria_foto?: string | null
  precio?: number | null
  estrella?: boolean
  activo?: boolean
  id_catalogo?: string | null
  id_empresa?: string | null
  nombre_empresa?: string | null
  nit_empresa?: string | null
  precio_sugerido?: number | null
  costo_produccion?: number | null
}

export interface ProductFormState {
  nombre_derivado: string
  descripcion: string
  imagen_url: string
  tag: string
  rating: string
}

export const initialProductForm: ProductFormState = {
  nombre_derivado: "",
  descripcion: "",
  imagen_url: "/images/cacao-beans.jpg",
  tag: "",
  rating: "4.8",
}
