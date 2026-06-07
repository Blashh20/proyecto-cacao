export const DICTIONARY_TABLES = {
  usuario: ["usuarios"],
  empresa: ["empresas"],
  regiones: ["regiones", "Regiones"],
  culturaRegion: ["cultura_region", "Cultura_Region"],
  fincas: ["fincas", "Fincas"],
  certificaciones: ["certificaciones", "Certificaciones"],
  serviciosTecnicos: ["servicios_tecnicos", "Servicios_Tecnicos"],
  productosDerivados: ["productos_derivados"],
  catalogoEmpresa: ["catalogo_empresa"],
  ventas: ["ventas"],
  serviciosTuristicos: ["servicios_turisticos"],
  impactoSostenibilidad: ["impacto_sostenibilidad"],
  puntosGeograficos: ["puntos_geograficos"],
  rutasTuristicas: ["rutas_turisticas"],
  puntosDeRuta: ["puntos_de_ruta"],
  galeriaFotos: ["galeria_fotos"],
  vinculoGaleria: ["vinculo_galeria"],
} as const

export type DictionaryTableKey = keyof typeof DICTIONARY_TABLES
