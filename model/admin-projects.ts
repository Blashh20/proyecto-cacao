export type AdminSection = "resumen" | "proyectos" | "produccion" | "mercado"

export interface FormState {
  name: string
  location: string
  lat: string
  lng: string
  description: string
  hectares: string
  families: string
  yearStarted: string
  production: string
  variety: string
  image: string
}

export interface AdminMetricSet {
  totalProjects: number
  totalFamilies: number
  totalHectares: number
  totalProduction: number
  avgProduction: number
  newestYear: number
}

export const initialFormState: FormState = {
  name: "",
  location: "",
  lat: "",
  lng: "",
  description: "",
  hectares: "",
  families: "",
  yearStarted: "",
  production: "",
  variety: "",
  image: "/images/cacao-pods.jpg",
}

export const marketData = [
  {
    title: "Mix comercial",
    value: "48% exportacion",
    description: "Mayor salida para cafe especial, cacao premium y derivados con valor agregado.",
  },
  {
    title: "Canal con mayor crecimiento",
    value: "Retail especializado",
    description: "Tiendas gourmet y marcas bean-to-bar con crecimiento sostenido.",
  },
  {
    title: "Oportunidad prioritaria",
    value: "Cafe y cacao premium",
    description: "Categorias de origen y trazabilidad con mejor margen comercial.",
  },
  {
    title: "Riesgo comercial",
    value: "Volatilidad de precios",
    description: "Conviene monitorear costo logistico, clima y demanda internacional.",
  },
]
