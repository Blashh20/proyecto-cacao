import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

import type { CatalogProduct, DistributionPoint, NewProjectInput, Project, ProjectGalleryImage } from "@/model/projects"

type DictionaryRow = Record<string, unknown>

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value)

const asNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function hashStringToInt(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

async function selectFirstAvailableTable<T extends DictionaryRow>(
  tableCandidates: readonly string[],
  select: string
): Promise<T[]> {
  for (const table of tableCandidates) {
    const { data, error } = await supabase.from(table).select(select)
    if (!error && Array.isArray(data)) return data as unknown as T[]
  }

  return []
}

const mapBy = (rows: DictionaryRow[], key: string) => {
  const result = new Map<string, DictionaryRow>()
  for (const row of rows) {
    const id = asString(row[key])
    if (id && !result.has(id)) result.set(id, row)
  }
  return result
}

const groupBy = (rows: DictionaryRow[], key: string) => {
  const result = new Map<string, DictionaryRow[]>()
  for (const row of rows) {
    const id = asString(row[key])
    if (!id) continue
    if (!result.has(id)) result.set(id, [])
    result.get(id)!.push(row)
  }
  return result
}

function getPointCoordinates(point?: DictionaryRow) {
  return {
    lat: asNumber(point?.latitud, 10.75),
    lng: asNumber(point?.longitud, -73.75),
  }
}

function buildCatalog(
  catalogRows: DictionaryRow[],
  productsById: Map<string, DictionaryRow>
): CatalogProduct[] {
  return catalogRows.map((item) => {
    const product = productsById.get(asString(item.id_producto))

    return {
      id_catalog: asString(item.id_catalogo),
      price: asNumber(item.precio_sugerido, 0),
      cost: asNumber(item.costo_produccion, 0),
      product: {
        name: asString(product?.nombre_derivado),
        category: asString(product?.categoria),
        description: asString(product?.descripcion),
      },
    }
  })
}

function getRegionName(region?: DictionaryRow): string {
  return asString(
    region?.nombre_region ??
      region?.nombre ??
      region?.region ??
      region?.departamento ??
      region?.descripcion,
    ""
  )
}

function locationRegion(params: {
  idEmpresa: string
  finca?: DictionaryRow
  point?: DictionaryRow
  regionsByEmpresa: Map<string, DictionaryRow>
  regionsById: Map<string, DictionaryRow>
}): string {
  const { idEmpresa, finca, point, regionsByEmpresa, regionsById } = params
  const directRegion = regionsByEmpresa.get(idEmpresa)
  const directRegionName = getRegionName(directRegion)
  if (directRegionName) return directRegionName

  const regionId = asString(finca?.id_region) || asString(point?.id_region)
  const relatedRegion = regionsById.get(regionId)
  const relatedRegionName = getRegionName(relatedRegion)
  if (relatedRegionName) return relatedRegionName

  return asString(point?.nombre_lugar, "Sin región")
}

function buildGallery(
  entityId: string,
  links: DictionaryRow[],
  photosById: Map<string, DictionaryRow>
): ProjectGalleryImage[] {
  return links
    .filter((link) => asString(link.id_empresa) === entityId)
    .map((link) => {
      const photo = photosById.get(asString(link.id_foto))
      return {
        src: asString(photo?.url_foto, "/images/cacao-pods.jpg"),
        alt: asString(photo?.titulo, "Imagen del proyecto"),
        source: "galeria_fotos",
        sourceUrl: asString(photo?.url_foto, ""),
      }
    })
}

function transformEmpresaToProject(params: {
  empresa: DictionaryRow
  point?: DictionaryRow
  finca?: DictionaryRow
  impacto?: DictionaryRow
  catalog: CatalogProduct[]
  gallery: ProjectGalleryImage[]
  regionsByEmpresa: Map<string, DictionaryRow>
  regionsById: Map<string, DictionaryRow>
  index: number
}): Project {
  const { empresa, point, finca, impacto, catalog, gallery, regionsByEmpresa, regionsById, index } = params
  const idEmpresa = asString(empresa.id_empresa, `empresa-${index}`)
  const coordinates = getPointCoordinates(point)

  return {
    id: hashStringToInt(idEmpresa),
    id_empresa: idEmpresa,
    name: asString(empresa.nombre_comercial, "Empresa sin nombre"),
    nit: asString(empresa.nit),
    status: asString(empresa.estado_servicio, "Activo"),
    location: locationRegion({
      idEmpresa,
      finca,
      point,
      regionsByEmpresa,
      regionsById,
    }),
    coordinates,
    localType: asString(point?.tipo_punto, "Finca"),
    phone: "",
    description: asString(finca?.analisis_dofa, catalog[0]?.product.description || "Sin descripción disponible."),
    hectares: asNumber(finca?.area_hectareas, 0),
    families: asNumber(impacto?.empleos_comunitarios, 0),
    yearStarted: new Date(asString(empresa.fecha_creacion, new Date().toISOString())).getFullYear(),
    production: catalog.length > 0 ? `${catalog.length} productos` : "0 productos",
    variety: catalog[0]?.product.name || asString(finca?.nombre_finca, "Sin producto asociado"),
    image: gallery[0]?.src ?? "/images/default-business.jpg",
    catalog,
    distributionPoints: [
      {
        id: asString(point?.id_punto, idEmpresa),
        name: asString(point?.nombre_lugar, "Ubicación principal"),
        address: asString(point?.nombre_lugar, "Sin ubicación"),
        type: asString(point?.tipo_punto, "Finca"),
        phone: "",
        coordinates,
      } satisfies DistributionPoint,
    ],
    gallery,
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const [empresas, regiones, puntos, fincas, impactos, catalogo, productos, vinculos, fotos] = await Promise.all([
    selectFirstAvailableTable(DICTIONARY_TABLES.empresa, "id_empresa, nombre_comercial, nit, estado_servicio, id_usuario, id_punto_geografico, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.regiones, "*"),
    selectFirstAvailableTable(DICTIONARY_TABLES.puntosGeograficos, "id_punto_geografico, nombre_lugar, latitud, longitud, tipo_punto, id_region"),
    selectFirstAvailableTable(DICTIONARY_TABLES.fincas, "id_finca, id_empresa, id_region, nombre_finca, area_hectareas, geometria_poligono, cumple_norma_ue, analisis_dofa, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.impactoSostenibilidad, "id_impacto, id_finca, hectareas_conservadas, empleos_comunitarios, indice_regeneracion, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.catalogoEmpresa, "id_catalogo, id_empresa, id_producto, precio_sugerido, costo_produccion, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.productosDerivados, "id_producto, nombre_derivado, categoria, descripcion, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.vinculoGaleria, "id_vinculo, id_foto, entidad_tipo"),
    selectFirstAvailableTable(DICTIONARY_TABLES.galeriaFotos, "id_foto, url_foto, titulo, descripcion, fecha_creacion"),
  ])

  const regionsByEmpresa = mapBy(regiones, "id_empresa")
  const regionsById = mapBy(regiones, "id_region")
  const puntosById = mapBy(puntos, "id_punto_geografico")
  const fincasByEmpresa = groupBy(fincas, "id_empresa")
  const impactosByFinca = groupBy(impactos, "id_finca")
  const catalogByEmpresa = groupBy(catalogo, "id_empresa")
  const productsById = mapBy(productos, "id_producto")
  const photosById = mapBy(fotos, "id_foto")

  return empresas.map((empresa, index) => {
    const idEmpresa = asString(empresa.id_empresa, `empresa-${index}`)
    const finca = fincasByEmpresa.get(idEmpresa)?.[0]
    const impacto = finca ? impactosByFinca.get(asString(finca.id_finca))?.[0] : undefined
    const catalog = buildCatalog(catalogByEmpresa.get(idEmpresa) ?? [], productsById)
    const gallery = buildGallery(idEmpresa, vinculos, photosById)

    return transformEmpresaToProject({
      empresa,
      point: puntosById.get(asString(empresa.id_punto_geografico)),
      finca,
      impacto,
      catalog,
      gallery,
      regionsByEmpresa,
      regionsById,
      index,
    })
  })
}

export async function createProject(project: NewProjectInput): Promise<Project> {
  return {
    id: Date.now(),
    name: project.name,
    nit: project.nit ?? "",
    status: project.status ?? "Activo",
    location: project.location,
    coordinates: {
      lat: project.lat,
      lng: project.lng,
    },
    localType: project.localType ?? "Finca",
    phone: project.phone ?? "",
    description: project.description,
    hectares: Number(project.hectares ?? 0),
    families: Number(project.families ?? 0),
    yearStarted: Number(project.yearStarted ?? 2026),
    production: String(project.production ?? "0"),
    variety: project.variety ?? "Sin variedad",
    image: project.image,
    catalog: project.catalog ?? [],
    distributionPoints: project.distributionPoints ?? [],
    gallery: project.gallery ?? [],
  }
}
