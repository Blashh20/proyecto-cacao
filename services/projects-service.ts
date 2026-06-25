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

const cleanPayload = (payload: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""))

function isSchemaColumnError(message: string): boolean {
  return message.includes("schema cache") || message.includes("Could not find") || message.includes("column")
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

async function fetchEmpresaRows(): Promise<DictionaryRow[]> {
  const selectVariants = [
    "id_empresa, nombre_comercial, nit, estado_servicio, id_usuario, id_punto_geografico, fecha_creacion, imagen_url",
    "id_empresa, nombre_comercial, nit, estado_servicio, id_usuario, id_punto_geografico, fecha_creacion",
  ]

  for (const select of selectVariants) {
    const rows = await selectFirstAvailableTable(DICTIONARY_TABLES.empresa, select)
    if (rows.length > 0) return rows
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

async function insertGeoPoint(project: NewProjectInput): Promise<string> {
  const { data, error } = await supabase
    .from(DICTIONARY_TABLES.puntosGeograficos[0])
    .insert({
      nombre_lugar: project.location,
      latitud: project.lat,
      longitud: project.lng,
      tipo_punto: project.localType ?? "Finca",
    })
    .select("id_punto_geografico")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el punto geografico")
  }

  return asString(data.id_punto_geografico)
}

async function updateGeoPoint(project: Project, projectUpdate: Partial<NewProjectInput>): Promise<string | undefined> {
  const nextLocation = projectUpdate.location ?? project.location
  const nextLat = projectUpdate.lat ?? project.coordinates.lat
  const nextLng = projectUpdate.lng ?? project.coordinates.lng
  const nextType = projectUpdate.localType ?? project.localType

  if (project.id_punto_geografico) {
    const { error } = await supabase
      .from(DICTIONARY_TABLES.puntosGeograficos[0])
      .update({
        nombre_lugar: nextLocation,
        latitud: nextLat,
        longitud: nextLng,
        tipo_punto: nextType,
      })
      .eq("id_punto_geografico", project.id_punto_geografico)

    if (error) throw new Error(error.message)
    return project.id_punto_geografico
  }

  if (project.id_empresa) {
    const { data, error } = await supabase
      .from(DICTIONARY_TABLES.puntosGeograficos[0])
      .insert({
        nombre_lugar: nextLocation,
        latitud: nextLat,
        longitud: nextLng,
        tipo_punto: nextType,
      })
      .select("id_punto_geografico")
      .single()

    if (error || !data) throw new Error(error?.message ?? "No se pudo crear el punto geografico")
    return asString(data.id_punto_geografico)
  }

  return undefined
}

async function saveProjectGalleryImage(nitEmpresa: string, imageUrl?: string, title?: string) {
  if (!imageUrl) return

  const { data: photo, error: photoError } = await supabase
    .from(DICTIONARY_TABLES.galeriaFotos[0])
    .insert({
      url_foto: imageUrl,
      titulo: title ?? "Imagen del proyecto",
      descripcion: title ?? "Imagen del proyecto",
    })
    .select("id_foto")
    .single()

  if (photoError || !photo) return

  await supabase.from(DICTIONARY_TABLES.vinculoGaleria[0]).insert({
    id_foto: asString(photo.id_foto),
    nit_empresa: nitEmpresa,
    entidad_tipo: "empresa",
  })
}

async function replaceProjectGalleryImages(
  project: { nit?: string; previousNit?: string },
  gallery?: ProjectGalleryImage[]
) {
  const validImages = (gallery ?? []).filter((image) => asString(image.src).trim())
  const nitEmpresa = asString(project.nit).trim()
  const nitsToClear = [project.previousNit, nitEmpresa]
    .map((value) => asString(value).trim())
    .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)

  if (validImages.length > 0 && !nitEmpresa) {
    throw new Error("El NIT de la empresa es obligatorio para guardar la galeria del proyecto")
  }

  if (nitsToClear.length === 0) return

  await Promise.all(
    nitsToClear.map((nit) => deleteProjectGalleryImages(nit))
  )

  if (validImages.length === 0) return

  await Promise.all(
    validImages.map((image) =>
      saveProjectGalleryImage(nitEmpresa, image.src, image.alt || "Imagen del proyecto")
    )
  )
}

async function deleteProjectGalleryImages(nitEmpresa?: string) {
  const nit = asString(nitEmpresa).trim()
  if (!nit) return

  const { data: links, error: linksError } = await supabase
    .from(DICTIONARY_TABLES.vinculoGaleria[0])
    .select("id_foto")
    .eq("nit_empresa", nit)
    .eq("entidad_tipo", "empresa")

  if (linksError) throw new Error(linksError.message)

  const photoIds = (links ?? [])
    .map((link) => asString(link.id_foto).trim())
    .filter((id, index, ids): id is string => Boolean(id) && ids.indexOf(id) === index)

  const { error: linksDeleteError } = await supabase
    .from(DICTIONARY_TABLES.vinculoGaleria[0])
    .delete()
    .eq("nit_empresa", nit)
    .eq("entidad_tipo", "empresa")

  if (linksDeleteError) throw new Error(linksDeleteError.message)

  if (photoIds.length === 0) return

  const { error: photosDeleteError } = await supabase
    .from(DICTIONARY_TABLES.galeriaFotos[0])
    .delete()
    .in("id_foto", photoIds)

  if (photosDeleteError) throw new Error(photosDeleteError.message)
}

async function deleteRowsByColumn(table: string, column: string, value?: string) {
  const safeValue = asString(value).trim()
  if (!safeValue) return

  const { error } = await supabase
    .from(table)
    .delete()
    .eq(column, safeValue)

  if (error && !isSchemaColumnError(error.message)) {
    throw new Error(error.message)
  }
}

async function deleteProjectRoutes(idEmpresa?: string, nitEmpresa?: string) {
  const routeIds = new Set<string>()

  for (const [column, value] of [
    ["id_empresa", idEmpresa],
    ["nit_empresa", nitEmpresa],
  ] as const) {
    const safeValue = asString(value).trim()
    if (!safeValue) continue

    const { data, error } = await supabase
      .from(DICTIONARY_TABLES.rutasTuristicas[0])
      .select("id_ruta")
      .eq(column, safeValue)

    if (error) {
      if (isSchemaColumnError(error.message)) continue
      throw new Error(error.message)
    }

    for (const route of data ?? []) {
      const idRuta = asString(route.id_ruta).trim()
      if (idRuta) routeIds.add(idRuta)
    }
  }

  if (routeIds.size > 0) {
    const { error } = await supabase
      .from(DICTIONARY_TABLES.puntosDeRuta[0])
      .delete()
      .in("id_ruta", [...routeIds])

    if (error && !isSchemaColumnError(error.message)) {
      throw new Error(error.message)
    }
  }

  await deleteRowsByColumn(DICTIONARY_TABLES.rutasTuristicas[0], "id_empresa", idEmpresa)
  await deleteRowsByColumn(DICTIONARY_TABLES.rutasTuristicas[0], "nit_empresa", nitEmpresa)
}

async function deleteProjectFarmsAndImpact(idEmpresa: string) {
  const { data: fincas, error } = await supabase
    .from(DICTIONARY_TABLES.fincas[0])
    .select("id_finca")
    .eq("id_empresa", idEmpresa)

  if (error) throw new Error(error.message)

  const fincaIds = (fincas ?? [])
    .map((finca) => asString(finca.id_finca).trim())
    .filter((id, index, ids): id is string => Boolean(id) && ids.indexOf(id) === index)

  if (fincaIds.length > 0) {
    const { error: impactError } = await supabase
      .from(DICTIONARY_TABLES.impactoSostenibilidad[0])
      .delete()
      .in("id_finca", fincaIds)

    if (impactError) throw new Error(impactError.message)
  }

  const { error: fincaDeleteError } = await supabase
    .from(DICTIONARY_TABLES.fincas[0])
    .delete()
    .eq("id_empresa", idEmpresa)

  if (fincaDeleteError) throw new Error(fincaDeleteError.message)
}

async function updateEmpresaRow(idEmpresa: string, payload: Record<string, unknown>) {
  const { error } = await supabase
    .from(DICTIONARY_TABLES.empresa[0])
    .update(payload)
    .eq("id_empresa", idEmpresa)

  if (!error) return

  if ("imagen_url" in payload && isSchemaColumnError(error.message)) {
    const { imagen_url, ...rest } = payload
    const fallbackPayload = cleanPayload({
      ...rest,
      image_url: imagen_url,
    })

    const fallback = await supabase
      .from(DICTIONARY_TABLES.empresa[0])
      .update(fallbackPayload)
      .eq("id_empresa", idEmpresa)

    if (!fallback.error) return
    throw new Error(fallback.error.message)
  }

  throw new Error(error.message)
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
  entityIds: string[],
  links: DictionaryRow[],
  photosById: Map<string, DictionaryRow>
): ProjectGalleryImage[] {
  const normalizedEntityIds = new Set(entityIds.filter(Boolean))
  const seenPhotos = new Set<string>()

  return links
    .filter((link) => normalizedEntityIds.has(asString(link.nit_empresa)))
    .filter((link) => {
      const photoId = asString(link.id_foto)
      if (!photoId || seenPhotos.has(photoId)) return false
      seenPhotos.add(photoId)
      return true
    })
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
    id_punto_geografico: asString(point?.id_punto_geografico) || undefined,
    id_finca: asString(finca?.id_finca) || undefined,
    id_impacto: asString(impacto?.id_impacto) || undefined,
    name: asString(empresa.nombre_comercial, "Empresa sin nombre"),
    nit: asString(empresa.nit),
    status: asString(empresa.estado_servicio, "Activo"),
    ownerId: asString(empresa.id_usuario),
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
    image_url: asString(empresa.imagen_url ?? empresa.image_url, gallery[0]?.src ?? "/images/default-business.jpg"),
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
    fetchEmpresaRows(),
    selectFirstAvailableTable(DICTIONARY_TABLES.regiones, "*"),
    selectFirstAvailableTable(DICTIONARY_TABLES.puntosGeograficos, "id_punto_geografico, nombre_lugar, latitud, longitud, tipo_punto, id_region"),
    selectFirstAvailableTable(DICTIONARY_TABLES.fincas, "id_finca, id_empresa, id_region, nombre_finca, area_hectareas, geometria_poligono, cumple_norma_ue, analisis_dofa, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.impactoSostenibilidad, "id_impacto, id_finca, hectareas_conservadas, empleos_comunitarios, indice_regeneracion, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.catalogoEmpresa, "id_catalogo, id_empresa, id_producto, precio_sugerido, costo_produccion, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.productosDerivados, "id_producto, nombre_derivado, categoria, descripcion, fecha_creacion"),
    selectFirstAvailableTable(DICTIONARY_TABLES.vinculoGaleria, "id_vinculo, id_foto, nit_empresa, entidad_tipo"),
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
    const nitEmpresa = asString(empresa.nit)
    const finca = fincasByEmpresa.get(idEmpresa)?.[0]
    const impacto = finca ? impactosByFinca.get(asString(finca.id_finca))?.[0] : undefined
    const catalog = buildCatalog(catalogByEmpresa.get(idEmpresa) ?? [], productsById)
    const gallery = buildGallery([idEmpresa, nitEmpresa], vinculos, photosById)

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
  const idEmpresa = crypto.randomUUID()
  const idPunto = await insertGeoPoint(project)

  const { error: empresaError } = await supabase
    .from(DICTIONARY_TABLES.empresa[0])
    .insert(cleanPayload({
      id_empresa: idEmpresa,
      nombre_comercial: project.name,
      nit: project.nit,
      estado_servicio: project.status ?? "Activo",
      id_usuario: project.ownerId,
      id_punto_geografico: idPunto,
      imagen_url: project.image,
    }))

  if (empresaError) {
    // Limpiar punto geográfico si la empresa falló
    await supabase
      .from(DICTIONARY_TABLES.puntosGeograficos[0])
      .delete()
      .eq("id_punto_geografico", idPunto)
    throw new Error(empresaError.message)
  }

  const { data: finca, error: fincaError } = await supabase
    .from(DICTIONARY_TABLES.fincas[0])
    .insert(cleanPayload({
      id_empresa: idEmpresa,
      nit_empresa: project.nit,       // ← fix: NOT NULL constraint
      nombre_finca: project.variety ?? project.name,
      area_hectareas: Number(project.hectares ?? 0),
      analisis_dofa: project.description,
    }))
    .select("id_finca")
    .single()

  if (fincaError) throw new Error(fincaError.message)

  const idFinca = asString(finca?.id_finca)
  let idImpacto: string | undefined

  if (idFinca) {
    const { data: impacto } = await supabase
      .from(DICTIONARY_TABLES.impactoSostenibilidad[0])
      .insert({
        id_finca: idFinca,
        empleos_comunitarios: Number(project.families ?? 0),
      })
      .select("id_impacto")
      .single()

    idImpacto = asString(impacto?.id_impacto) || undefined
  }

  await replaceProjectGalleryImages({ nit: project.nit }, project.gallery)

  return {
    id: hashStringToInt(idEmpresa),
    id_empresa: idEmpresa,
    id_punto_geografico: idPunto,
    id_finca: idFinca || undefined,
    id_impacto: idImpacto,
    name: project.name,
    nit: project.nit ?? "",
    status: project.status ?? "Activo",
    ownerId: project.ownerId,
    ownerEmail: project.ownerEmail,
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
    image_url: project.image,
    catalog: project.catalog ?? [],
    distributionPoints: project.distributionPoints ?? [],
    gallery: project.gallery ?? [],
  }
}

export async function updateProject(project: Project, projectUpdate: Partial<NewProjectInput>): Promise<Project> {
  if (!project.id_empresa) {
    throw new Error("Este proyecto no tiene id_empresa remoto para actualizar en Supabase")
  }

  const idPunto = await updateGeoPoint(project, projectUpdate)

  const empresaPayload = cleanPayload({
    nombre_comercial: projectUpdate.name,
    nit: projectUpdate.nit,
    estado_servicio: projectUpdate.status,
    id_usuario: projectUpdate.ownerId,
    id_punto_geografico: idPunto,
    imagen_url: projectUpdate.image,
  })

  if (Object.keys(empresaPayload).length > 0) {
    await updateEmpresaRow(project.id_empresa, empresaPayload)
  }

  let idFinca = project.id_finca
  const fincaPayload = cleanPayload({
    nombre_finca: projectUpdate.variety,
    area_hectareas: projectUpdate.hectares,
    analisis_dofa: projectUpdate.description,
  })

  if (Object.keys(fincaPayload).length > 0) {
    if (idFinca) {
      const { error } = await supabase
        .from(DICTIONARY_TABLES.fincas[0])
        .update(fincaPayload)
        .eq("id_finca", idFinca)

      if (error) throw new Error(error.message)
    } else {
      const { data, error } = await supabase
        .from(DICTIONARY_TABLES.fincas[0])
        .insert({ 
          ...fincaPayload, 
          id_empresa: project.id_empresa,
          nit_empresa: projectUpdate.nit ?? project.nit ?? "" // 🔥 CORRECCIÓN: Evita el error 'violates not-null constraint'
        })
        .select("id_finca")
        .single()

      if (error || !data) throw new Error(error?.message ?? "No se pudo crear la finca")
      idFinca = asString(data.id_finca)
    }
  }

  let idImpacto = project.id_impacto
  if (projectUpdate.families !== undefined && idFinca) {
    if (idImpacto) {
      const { error } = await supabase
        .from(DICTIONARY_TABLES.impactoSostenibilidad[0])
        .update({ empleos_comunitarios: projectUpdate.families })
        .eq("id_impacto", idImpacto)

      if (error) throw new Error(error.message)
    } else {
      const { data, error } = await supabase
        .from(DICTIONARY_TABLES.impactoSostenibilidad[0])
        .insert({
          id_finca: idFinca,
          empleos_comunitarios: projectUpdate.families,
        })
        .select("id_impacto")
        .single()

      if (error || !data) throw new Error(error?.message ?? "No se pudo crear el impacto")
      idImpacto = asString(data.id_impacto)
    }
  }

  if (projectUpdate.gallery) {
    await replaceProjectGalleryImages(
      { nit: projectUpdate.nit ?? project.nit, previousNit: project.nit },
      projectUpdate.gallery
    )
  }

  return {
    ...project,
    id_punto_geografico: idPunto ?? project.id_punto_geografico,
    id_finca: idFinca,
    id_impacto: idImpacto,
    name: projectUpdate.name ?? project.name,
    nit: projectUpdate.nit ?? project.nit,
    status: projectUpdate.status ?? project.status,
    ownerId: projectUpdate.ownerId ?? project.ownerId,
    ownerEmail: projectUpdate.ownerEmail ?? project.ownerEmail,
    location: projectUpdate.location ?? project.location,
    coordinates: {
      lat: projectUpdate.lat ?? project.coordinates.lat,
      lng: projectUpdate.lng ?? project.coordinates.lng,
    },
    localType: projectUpdate.localType ?? project.localType,
    phone: projectUpdate.phone ?? project.phone,
    description: projectUpdate.description ?? project.description,
    image_url: projectUpdate.image ?? project.image_url,
    hectares: projectUpdate.hectares ?? project.hectares,
    families: projectUpdate.families ?? project.families,
    yearStarted: projectUpdate.yearStarted ?? project.yearStarted,
    production: projectUpdate.production ?? project.production,
    variety: projectUpdate.variety ?? project.variety,
    catalog: projectUpdate.catalog ?? project.catalog,
    distributionPoints: projectUpdate.distributionPoints ?? project.distributionPoints,
    gallery: projectUpdate.gallery ?? project.gallery,
  }
}

// ============================================================
// TIPOS
// ============================================================

type DeleteMode = "hard" | "soft"

// ============================================================
// HELPERS
// ============================================================

const tryDelete = async (table: string, column: string, value?: string) => {
  const safeValue = asString(value).trim()
  if (!safeValue) return
  const { error } = await supabase.from(table).delete().eq(column, safeValue)
  if (error && !isSchemaColumnError(error.message)) throw new Error(`[${table}] ${error.message}`)
}

const tryUpdate = async (table: string, column: string, value?: string, data?: Record<string, unknown>) => {
  const safeValue = asString(value).trim()
  if (!safeValue || !data) return
  const { error } = await supabase.from(table).update(data).eq(column, safeValue)
  if (error && !isSchemaColumnError(error.message)) throw new Error(`[${table}] ${error.message}`)
}

// ============================================================
// HELPERS DE FINCAS
// ============================================================

const getFincaIdsByEmpresa = async (id_empresa: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("fincas")
    .select("id_finca")
    .eq("id_empresa", id_empresa)

  if (error) throw new Error(`[fincas] ${error.message}`)
  return (data ?? []).map((f) => f.id_finca)
}

const deleteProjectFarmsAndImpactLegacy = async (id_empresa?: string) => {
  if (!id_empresa) return

  const fincaIds = await getFincaIdsByEmpresa(id_empresa)

  for (const id_finca of fincaIds) {
    // Certificaciones → dependen de id_finca
    await tryDelete("certificaciones", "id_finca", id_finca)

    // Impacto sostenibilidad → depende de id_finca
    await tryDelete("impacto_sostenibilidad", "id_finca", id_finca)

    // Servicios técnicos → dependen de id_finca
    await tryDelete("servicios_tecnicos", "id_finca", id_finca)

    // Servicios turísticos → dependen de id_finca
    await tryDelete("servicios_turisticos", "id_finca", id_finca)
  }

  // Fincas
  await tryDelete("fincas", "id_empresa", id_empresa)
}

const softDeactivateFarmsAndImpact = async (id_empresa?: string) => {
  if (!id_empresa) return
  // Solo marcamos las fincas como no conformes (no hay campo activo en fincas)
  // Si se agrega `activo` a fincas en el futuro, aquí iría el update
  await tryUpdate("fincas", "id_empresa", id_empresa, { cumple_norma_ue: false })
}

// ============================================================
// HELPER DE RUTAS
// ============================================================

const deleteProjectRoutesLegacy = async (id_empresa?: string, nit?: string) => {
  if (!id_empresa && !nit) return

  // Obtener ids de rutas de esta empresa
  const query = supabase.from("rutas_turisticas").select("id_ruta")
  if (id_empresa) query.eq("id_empresa", id_empresa)
  const { data: rutas, error } = await query

  if (error) throw new Error(`[rutas_turisticas] ${error.message}`)

  for (const ruta of rutas ?? []) {
    // Puntos de ruta dependen de id_ruta
    await tryDelete("puntos_de_ruta", "id_ruta", ruta.id_ruta)
  }

  if (id_empresa) await tryDelete("rutas_turisticas", "id_empresa", id_empresa)
  if (nit) await tryDelete("rutas_turisticas", "nit_empresa", nit)
}

// ============================================================
// HELPER DE GALERÍA
// ============================================================

const deleteProjectGalleryImagesLegacy = async (nit?: string) => {
  if (!nit) return

  // Obtener ids de fotos vinculadas a esta empresa
  const { data: vinculos, error } = await supabase
    .from("vinculo_galeria")
    .select("id_foto")
    .eq("nit_empresa", nit)

  if (error) throw new Error(`[vinculo_galeria] ${error.message}`)

  // Borrar vínculos primero
  await tryDelete("vinculo_galeria", "nit_empresa", nit)

  // Borrar fotos huérfanas
  for (const v of vinculos ?? []) {
    if (!v.id_foto) continue
    // Verificar que no tenga otros vínculos antes de borrar la foto
    const { count } = await supabase
      .from("vinculo_galeria")
      .select("id_vinculo", { count: "exact", head: true })
      .eq("id_foto", v.id_foto)

    if ((count ?? 0) === 0) {
      await tryDelete("galeria_fotos", "id_foto", v.id_foto)
      await tryDelete("galeria_foto", "id_galeria_foto", v.id_foto)
    }
  }
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

export async function deleteProject(project: Project, mode: DeleteMode = "hard"): Promise<void> {
  if (!project.id_empresa) {
    throw new Error("Este proyecto no tiene id_empresa remoto para eliminar en Supabase")
  }

  const { id_empresa, nit, id_punto_geografico } = project

  // ── SOFT DELETE ────────────────────────────────────────────
  if (mode === "soft") {
    // Desactivar empleados
    await tryUpdate("empleados", "id_empresa", id_empresa, { activo: false })
    await tryUpdate("empleados", "nit_empresa", nit, { activo: false })

    // Desactivar productos del catálogo
    // (no hay campo activo en catalogo_empresa, se puede marcar precio en 0 o skip)

    // Desactivar productos derivados vinculados al catálogo de la empresa
    const { data: catalogoItems } = await supabase
      .from("catalogo_empresa")
      .select("id_producto")
      .eq("id_empresa", id_empresa)

    for (const item of catalogoItems ?? []) {
      if (item.id_producto) {
        await tryUpdate("productos_derivados", "id_producto", item.id_producto, { activo: false })
      }
    }

    // Desactivar rutas turísticas
    await tryUpdate("rutas_turisticas", "id_empresa", id_empresa, { activa: false })
    await tryUpdate("rutas_turisticas", "nit_empresa", nit, { activa: false })

    // Marcar fincas
    await softDeactivateFarmsAndImpact(id_empresa)

    // Desactivar empresa — usa el campo estado_servicio
    const { error } = await supabase
      .from("empresas")
      .update({ estado_servicio: "inactivo" })
      .eq("id_empresa", id_empresa)

    if (error) throw new Error(`[empresas] ${error.message}`)
    return
  }

  // ── HARD DELETE ────────────────────────────────────────────

  // 1. Galería y vínculos
  await deleteProjectGalleryImagesLegacy(nit)

  // 2. Puntos de ruta → rutas turísticas
  await deleteProjectRoutesLegacy(id_empresa, nit)

  // 3. Ventas
  await tryDelete("ventas", "id_empresa", id_empresa)

  // 4. Catálogo
  await tryDelete("catalogo_empresa", "id_empresa", id_empresa)
  await tryDelete("catalogo_empresa", "nit_empresa", nit)

  // 5. Empleados
  await tryDelete("empleados", "id_empresa", id_empresa)
  await tryDelete("empleados", "nit_empresa", nit)

  // 6. Puntos de distribución
  await tryDelete("puntos_distribucion", "id_empresa", id_empresa)
  await tryDelete("puntos_distribucion", "nit_empresa", nit)

  // 7. Certificaciones → impacto → servicios → fincas
  await deleteProjectFarmsAndImpactLegacy(id_empresa)

  // 8. Comunidades locales vinculadas al punto geográfico de la empresa
  if (id_punto_geografico) {
    await tryDelete("comunidades_locales", "id_punto_geografico", id_punto_geografico)
    await tryDelete("puntos_geograficos", "id_punto_geografico", id_punto_geografico)
  }

  // 9. Empresa
  const { error } = await supabase
    .from("empresas")
    .delete()
    .eq("id_empresa", id_empresa)

  if (error) throw new Error(`[empresas] ${error.message}`)
}
