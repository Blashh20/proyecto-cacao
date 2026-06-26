export interface ProductItem {
  nit: string
  nombre_comercial: string
  id_producto: string
  nombre_derivado: string
  descripcion: string
  categoria?: string
  imagen_url: string
  precio_unitario: number
  costo_produccion: number
  tag: string
  activo?: boolean
  estrella?: boolean
  id_foto: string
}
