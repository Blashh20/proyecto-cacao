import { Actualizar_Imagen, Eliminar_Imagen, Subir_Imagen } from "@/services/storage";


export async function SubirImagen(file : File , folder : string){
    const url_foto = await Subir_Imagen(file , folder)
    return url_foto;
}

export async function EliminarImagen(url : string){
    const data = await Eliminar_Imagen(url)
    return data
}

export async function ActualizarImagen(file : File , url : string){
    const data = await Actualizar_Imagen(file, url)
    return data
}