import type { ProductItem} from "@/model/products"
import { supabase } from "@/services/client"

export async function consultarProductos(){
  const { data, error } = await supabase
    .from("catalogo_empresa")
    .select("empresas(nit,nombre_comercial),productos_derivados(id_producto,nombre_derivado,descripcion,categoria,activo,galeria_fotos(id_foto,url_foto)), precio_unitario, costo_produccion")

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

export async function actualizarProducto(id_producto: string, producto: Partial<ProductItem>){
  const updateData = {
    nombre_derivado: producto.nombre_derivado,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    activo: producto.activo,
  };

  const { data, error } = await supabase
    .from("productos_derivados")
    .update(updateData)
    .eq("id_producto", id_producto);
  
  const {error: imagen_error} = await supabase
    .from("galeria_fotos")
    .update({ url_foto: producto.imagen_url })
    .eq("id_foto", producto.id_foto);

  const { data: precioData, error: precioError } = await supabase
    .from("catalogo_empresa")
    .update({ precio_unitario: producto.precio_unitario })
    .eq("id_producto", id_producto);
  return {data, error, precioData, precioError};
}

export async function crearProducto(producto: ProductItem, id_finca: string){
  const { data: productoData, error: productoError } = await supabase
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
  return {productoData, productoError, fkData, fkError, galeriaData, galeriaError, insertedProductoData, insertedProductoError};
}