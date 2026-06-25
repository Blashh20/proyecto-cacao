// Puente temporal: las consultas administrativas de turismo viven en services/admin-tourism-service.
export {
  deleteTourismRoute,
  estimateTime,
  haversineKm,
  loadAllRoutes,
  loadEmpresas,
  saveTourismRoute,
  toggleActivaRoute,
  toggleDestacadaRoute,
} from "@/services/admin-tourism-service"

export type {
  EmpresaOption,
  SavedTourismRoute,
  TourismRouteFormData,
  TourismRoutePoint,
} from "@/services/admin-tourism-service"
