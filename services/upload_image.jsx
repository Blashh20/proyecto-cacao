import { supabase } from "@/lib/supabaseClient"

export const uploadImage = async (file) => {
    const filePath = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
        .from("Galeria")
        .upload(filePath, file)

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
        .from("Galeria")
        .getPublicUrl(filePath)

    return publicUrlData.publicUrl
}