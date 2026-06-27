import { supabase } from "@/services/client"

export async function consultar_Empresas() {
  const { data, error } = await supabase
    .from("empresas")
    .select("nit, nombre_comercial")
    if (error) throw new Error(error.message)
    console.log("Empresas consultadas:", data)
    return data ?? []
}