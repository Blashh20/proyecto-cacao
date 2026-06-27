import { supabase } from "@/services/client";
import { consultar_Empresas } from "@/services/empresa-service";

export async function ConsultarEmpresas() {
    const data = await consultar_Empresas()
    return data
}