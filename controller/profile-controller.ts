// Puente temporal: las consultas de perfil viven en services/profile-service.
export {
  getPaymentSettings,
  getProfile,
  getPurchases,
  parsePaymentMethods,
  savePaymentSettings,
  updateAuthPassword,
  updateAuthProfile,
  upsertInUsuarioTables,
} from "@/services/profile-service"
