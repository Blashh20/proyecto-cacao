import { supabase } from "@/services/client"

export async function uploadImage(file: File, bucket = "Galeria"): Promise<string> {
  const filePath = `${Date.now()}-${file.name}`

  const { error } = await supabase.storage.from(bucket).upload(filePath, file)
  if (error) throw error

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
  console.log("URL pública obtenida:", publicUrlData)
  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("No se pudo obtener la URL pública de la imagen subida.")
  }
  return publicUrlData.publicUrl
}