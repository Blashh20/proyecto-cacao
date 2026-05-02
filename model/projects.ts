export interface Project {
  id: number
  name: string
  location: string
  coordinates: { lat: number; lng: number }
  description: string
  hectares: number
  families: number
  yearStarted: number
  production: string
  variety: string
  image: string
  gallery?: ProjectGalleryImage[]
}

export interface ProjectGalleryImage {
  src: string
  alt: string
  source: string
  sourceUrl: string
}

export const defaultProjects: Project[] = [
  {
    id: 1,
    name: "Proyecto Arhuaco",
    location: "Pueblo Bello, Cesar",
    coordinates: { lat: 10.4167, lng: -73.5833 },
    description:
      "Proyecto ancestral desarrollado junto a la comunidad Arhuaca, preservando tecnicas milenarias de cultivo sostenible en las faldas de la Sierra Nevada. El cacao crece bajo la sombra de arboles nativos, creando un ecosistema unico.",
    hectares: 250,
    families: 85,
    yearStarted: 2015,
    production: "45 toneladas/ano",
    variety: "Criollo Porcelana",
    image: "/images/cacao-pods.jpg",
    gallery: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Comunidad_Arhuaca.jpg",
        alt: "Comunidad Arhuaca en la Sierra Nevada de Santa Marta",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Comunidad_Arhuaca.jpg",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sierra_Nevada_de_Santa_Marta.jpg/330px-Sierra_Nevada_de_Santa_Marta.jpg",
        alt: "Sierra Nevada de Santa Marta",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Sierra_Nevada_de_Santa_Marta.jpg",
      },
    ],
  },
  {
    id: 2,
    name: "Finca La Esperanza",
    location: "Cienaga, Magdalena",
    coordinates: { lat: 10.9086, lng: -74.2489 },
    description:
      "Una de nuestras fincas mas productivas, ubicada en la vertiente norte de la Sierra. Aqui combinamos tecnicas modernas de fermentacion con el conocimiento tradicional de los agricultores locales.",
    hectares: 180,
    families: 62,
    yearStarted: 2012,
    production: "38 toneladas/ano",
    variety: "Trinitario",
    image: "/images/plantation.jpg",
    gallery: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/4/49/Casa_Azul_de_Cienaga_Magdalena.JPG",
        alt: "Casa Azul de Cienaga, Magdalena",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Casa_Azul_de_Cienaga_Magdalena.JPG",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Playa_de_Ci%C3%A9naga%2C_Magdalena_2025-12-06.jpg",
        alt: "Playa de Cienaga, Magdalena",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Playa_de_Ci%C3%A9naga,_Magdalena_2025-12-06.jpg",
      },
    ],
  },
  {
    id: 3,
    name: "Reserva Kogui",
    location: "Santa Marta, Magdalena",
    coordinates: { lat: 11.15, lng: -74.05 },
    description:
      "En colaboracion con la comunidad Kogui, este proyecto protege 500 hectareas de bosque nativo mientras produce cacao de la mas alta calidad. Un ejemplo de conservacion y desarrollo sostenible.",
    hectares: 320,
    families: 120,
    yearStarted: 2018,
    production: "52 toneladas/ano",
    variety: "Criollo Fino",
    image: "/images/hero-jungle.jpg",
    gallery: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/1/12/Santa_Marta%2C_Colombia.jpg",
        alt: "Vista de Santa Marta, Colombia",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Santa_Marta,_Colombia.jpg",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/7/74/Santa_Marta%2C.jpg",
        alt: "Santa Marta, Magdalena",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Santa_Marta,.jpg",
      },
    ],
  },
  {
    id: 4,
    name: "Corredor del Cacao",
    location: "Aracataca, Magdalena",
    coordinates: { lat: 10.5917, lng: -74.1892 },
    description:
      "Proyecto emblematico en la tierra de Garcia Marquez. Conectamos a pequenos productores en un corredor agroforestal que promueve la biodiversidad y el comercio justo.",
    hectares: 420,
    families: 150,
    yearStarted: 2010,
    production: "75 toneladas/ano",
    variety: "CCN-51 Mejorado",
    image: "/images/cacao-beans.jpg",
    gallery: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Estaci%C3%B3n_del_ferrocarril_Aracataca.JPG",
        alt: "Estacion del ferrocarril en Aracataca",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Estaci%C3%B3n_del_ferrocarril_Aracataca.JPG",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Aracataca%27s_main_street.JPG/960px-Aracataca%27s_main_street.JPG",
        alt: "Calle principal de Aracataca",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Aracataca%27s_main_street.JPG",
      },
    ],
  },
  {
    id: 5,
    name: "Semillas del Futuro",
    location: "Valledupar, Cesar",
    coordinates: { lat: 10.4631, lng: -73.2532 },
    description:
      "Nuestro centro de investigacion y desarrollo. Aqui experimentamos con nuevas variedades de cacao resistentes al cambio climatico, mientras capacitamos a la proxima generacion de cacaoteros.",
    hectares: 150,
    families: 45,
    yearStarted: 2020,
    production: "25 toneladas/ano",
    variety: "Hibrido Experimental",
    image: "/images/fermentation.jpg",
    gallery: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/6/67/Plaza_Valledupar.jpg",
        alt: "Plaza de Valledupar",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Plaza_Valledupar.jpg",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Valledupar.png",
        alt: "Vista urbana de Valledupar",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Valledupar.png",
      },
    ],
  },
  {
    id: 6,
    name: "Valle del Rio Frio",
    location: "Zona Bananera, Magdalena",
    coordinates: { lat: 10.7833, lng: -74.15 },
    description:
      "Ubicado en las fertiles tierras del Valle del Rio Frio, este proyecto aprovecha las condiciones ideales de humedad y temperatura para producir cacao de aroma excepcional.",
    hectares: 200,
    families: 75,
    yearStarted: 2016,
    production: "40 toneladas/ano",
    variety: "Nacional Fino de Aroma",
    image: "/images/chocolate-artisan.jpg",
    gallery: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Magdalena_zona_bananera.jpg",
        alt: "Zona Bananera en Magdalena",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Magdalena_zona_bananera.jpg",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Zona_bananera.jpg",
        alt: "Calles de Zona Bananera",
        source: "Wikimedia Commons",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Zona_bananera.jpg",
      },
    ],
  },
]

