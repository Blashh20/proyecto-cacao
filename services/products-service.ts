import type { ProductItem} from "@/model/products"
import { supabase } from "@/services/client"

export async function consultar_Productos(){
  const { data, error } = await supabase
    .from("Fk_Productos_Finca")
    .select("fincas(nit,nombre_comercial),productos_derivados(id_producto,nombre_derivado,descripcion,categoria,activo, precio_unitario, costo_produccion, precio_sugerido, galeria_fotos(id_foto,url_foto))")

  if (error) throw new Error(error.message)
  console.log("Productos consultados:", data)
  return data ?? []
}

export async function eliminarProducto(id_producto: string, id_foto: string){
  const { data: imagenData, error: imagenError } = await supabase
    .from("galeria_fotos")
    .delete().eq("id_foto", id_foto)
  if (imagenError) throw new Error(imagenError.message)
  const { data, error } = await supabase
    .from("productos_derivados")
    .delete().eq("id_producto", id_producto)
  return {data, error};
}

export async function acualizarProducto(id_producto: string, producto: Partial<ProductItem>){
  const updateData = {
    nombre_derivado: producto.nombre_derivado,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    activo: producto.activo,
    precio_unitario : producto.precio_unitario,
  };

  const { data, error } = await supabase
    .from("productos_derivados")
    .update(updateData)
    .eq("id_producto", id_producto);
  
  const {error: imagen_error} = await supabase
    .from("galeria_fotos")
    .update({ url_foto: producto.imagen_url })
    .eq("id_foto", producto.id_foto);
  return {data, error};
}

export async function crearProducto(producto: ProductItem, id_finca: string){
  const { data: productoData, error } = await supabase
    .from("productos_derivados")
    .insert({
      nombre_derivado: producto.nombre_derivado,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      activo: producto.activo,
      precio_unitario: producto.precio_unitario,
      costo_produccion: producto.costo_produccion,
    })
    .select("id_producto")
    .single();
  const {data: fkData, error: fkError} = await supabase
    .from("FK_producto_finca")
    .insert({
      id_producto: productoData?.id_producto,
      id_finca: id_finca,
    })
  const {data: galeriaData, error: galeriaError} = await supabase
    .from("galeria_fotos")
    .insert({
      id_producto: productoData?.id_producto,
      url_foto: producto.imagen_url,
    })
    .select("id_foto")
    .single()
  const {data: insertedProductoData, error: insertedProductoError} = await supabase
    .from("productos_derivados")
    .update({
      id_galeria_foto: galeriaData?.id_foto,
    })
    .eq("id_producto", productoData?.id_producto)
  return {error};
}