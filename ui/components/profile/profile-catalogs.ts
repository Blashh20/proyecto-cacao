export const IDENTIFICATION_TYPES = [
  { value: "CC", label: "Cedula de ciudadania" },
  { value: "CE", label: "Cedula de extranjeria" },
  { value: "NIT", label: "NIT" },
  { value: "PAS", label: "Pasaporte" },
  { value: "PEP", label: "Permiso especial de permanencia" },
] as const

export const LOCATION_CATALOG = [
  {
    department: "Antioquia",
    municipalities: ["Apartado", "Caceres", "Chigorodo", "Dabeiba", "Medellin", "Necocli", "Turbo"],
  },
  {
    department: "Arauca",
    municipalities: ["Arauca", "Arauquita", "Fortul", "Saravena", "Tame"],
  },
  {
    department: "Bolivar",
    municipalities: ["Cartagena", "El Carmen de Bolivar", "Maria La Baja", "San Jacinto", "Santa Rosa del Sur"],
  },
  {
    department: "Boyaca",
    municipalities: ["Chitaraque", "Moniquira", "Otanche", "Pauna", "Tunja"],
  },
  {
    department: "Caldas",
    municipalities: ["Manizales", "Marquetalia", "Norcasia", "Samana", "Victoria"],
  },
  {
    department: "Cauca",
    municipalities: ["El Tambo", "Mercaderes", "Miranda", "Popayan", "Santander de Quilichao"],
  },
  {
    department: "Cesar",
    municipalities: ["Aguachica", "Agustin Codazzi", "La Jagua de Ibirico", "Pueblo Bello", "Valledupar"],
  },
  {
    department: "Cordoba",
    municipalities: ["Monteria", "Montelibano", "Planeta Rica", "Tierralta", "Valencia"],
  },
  {
    department: "Cundinamarca",
    municipalities: ["Bogota D.C.", "La Palma", "Medina", "Pacho", "Yacopi"],
  },
  {
    department: "Huila",
    municipalities: ["Campoalegre", "Garzon", "Neiva", "Rivera", "Tello"],
  },
  {
    department: "La Guajira",
    municipalities: ["Dibulla", "Fonseca", "Riohacha", "San Juan del Cesar", "Villanueva"],
  },
  {
    department: "Magdalena",
    municipalities: ["Aracataca", "Cienaga", "Fundacion", "Santa Marta", "Zona Bananera"],
  },
  {
    department: "Meta",
    municipalities: ["Acacias", "Granada", "Lejanias", "Mesetas", "Villavicencio"],
  },
  {
    department: "Narino",
    municipalities: ["Tumaco", "Barbacoas", "El Charco", "Pasto", "Samaniego"],
  },
  {
    department: "Norte de Santander",
    municipalities: ["Cucuta", "El Tarra", "Ocaña", "Sardinata", "Tibu"],
  },
  {
    department: "Santander",
    municipalities: ["Bucaramanga", "El Carmen de Chucuri", "Landazuri", "San Vicente de Chucuri", "Rionegro"],
  },
  {
    department: "Tolima",
    municipalities: ["Chaparral", "Ibague", "Planadas", "Rioblanco", "Rovira"],
  },
  {
    department: "Valle del Cauca",
    municipalities: ["Buga", "Cali", "Palmira", "Tulua", "Zarzal"],
  },
] as const

export const PROJECT_TYPES = [
  "Finca",
  "Asociacion",
  "Centro de acopio",
  "Transformador",
  "Punto de venta",
] as const

export const PRODUCTION_RANGES = [
  "Menos de 10 toneladas/ano",
  "10 a 25 toneladas/ano",
  "26 a 50 toneladas/ano",
  "51 a 100 toneladas/ano",
  "Mas de 100 toneladas/ano",
] as const

export const CACAO_VARIETIES = [
  "Criollo",
  "Forastero",
  "Trinitario",
  "CCN-51",
  "Regional fino de aroma",
  "Mezcla regional",
] as const

export function getMunicipalitiesByDepartment(department: string) {
  return LOCATION_CATALOG.find((item) => item.department === department)?.municipalities ?? []
}
