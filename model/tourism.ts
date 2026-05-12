export type RoutePoint = {
  id_punto: string
  name: string

  latitude: number
  longitude: number

  type: string // mirador, finca, cascada, hidratación

  image?: string
  history?: string
  description?: string

  order: number

  regionId?: string
}

export type TouristRoute = {
  id_ruta: string
  name: string
  difficulty: string
  duration: string
  points: RoutePoint[]
}