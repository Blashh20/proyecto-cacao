// ===============================
// model/projects.ts
// ===============================

export interface Project {
  id: number
  id_empresa?: string
  id_punto_geografico?: string
  id_finca?: string
  id_impacto?: string

  // Empresa
  name: string
  nit: string
  status: string
  ownerId?: string
  ownerEmail?: string

  // Punto principal
  location: string

  coordinates: {
    lat: number
    lng: number
  }

  localType: string
  phone: string

  description: string

  hectares: number
  families: number
  yearStarted: number
  production: string
  variety: string

  image_url: string

  catalog: CatalogProduct[]

  distributionPoints: DistributionPoint[]

  gallery?: ProjectGalleryImage[]
}

export interface DistributionPoint {
  id: string

  name: string
  address: string
  type: string
  phone: string

  coordinates: {
    lat: number
    lng: number
  }
}

export interface CatalogProduct {
  id_catalog: string

  price: number
  cost: number

  product: {
    name: string
    category: string
    description: string
  }
}

export interface ProjectGalleryImage {
  src: string
  alt: string
  source: string
  sourceUrl: string
}

export interface NewProjectInput {
  name: string
  nit?: string
  status?: string
  ownerId?: string
  ownerEmail?: string

  location: string

  lat: number
  lng: number

  localType?: string
  phone?: string

  description: string
  hectares?: number
  families?: number
  yearStarted?: number
  production?: string
  variety?: string

  image: string

  catalog?: CatalogProduct[]

  distributionPoints?: DistributionPoint[]

  gallery?: ProjectGalleryImage[]
}
