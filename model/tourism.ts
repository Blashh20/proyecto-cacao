export type RoutePoint = {
  id_punto: string
  nombre_lugar: string
  latitud: number
  longitud: number
  tipo_punto: string
  id_region: string
  orden: number
  id_ruta_punto?: string
}

export type TouristRoute = {
  id_ruta: string
  nombre_ruta: string
  distancia_total: number
  tiempo_estimado: string
  nivel_dificultad: "Bajo" | "Medio" | "Alto" | string
  id_empresa: string
  points: RoutePoint[]
}
