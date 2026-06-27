import { supabase } from "@/services/client"

export async function Subir_Imagen(file: File, folder: string): Promise<string> {
  const filePath = `${folder}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("Galeria")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("Galeria")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function Eliminar_Imagen(
  publicUrl: string,
  bucket = "Galeria"
): Promise<String> {
  const path = publicUrl.split(`/object/public/${bucket}/`)[1];

  if (!path) {
    throw new Error("La URL pública no es válida.");
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;

  console.log("Imagen eliminada:", data);

  return "exito"
}

export async function Actualizar_Imagen(
  file: File,
  path: string,
  bucket = "Galeria"
): Promise<String> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .update(path, file, {
      upsert: true,
    });

  if (error) throw error;

  console.log("Imagen actualizada:", data);

  return "exito"
}