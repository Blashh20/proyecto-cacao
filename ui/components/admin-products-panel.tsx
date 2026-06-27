"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { Eye, EyeOff, ImagePlus, PackagePlus, Pencil, PlusCircle, RotateCcw, Save, Search, Star, Tags, Trash2, X } from "lucide-react"

import { useAuth } from "@/controller/auth-controller"
import type { ProductItem } from "@/model/products"
import { supabase } from "@/services/client"
import {crear_producto_admin} from "@/controller/admin-products-panel-controller"
import { Consultar_Products } from "@/controller/products-controller"
import { ConsultarEmpresas } from "@/controller/empresa-controller"

interface ProductFormState {
  nombre_derivado: string
  descripcion: string
  categoria: string
  nit: string
  precio_sugerido: string
  costo_produccion: string
  estrella: boolean
  activo: boolean
}

type ProductEventPayload = {
  id_producto: string
  nombre_derivado?: string | null
  descripcion?: string | null
  categoria?: string | null
  estrella?: boolean | null
  activo?: boolean | null
  id_catalogo?: string | null
  nit?: string | null
  precio_sugerido?: number | null
  costo_produccion?: number | null
  galeria_fotos?: {
    id_foto?: string | null
    url_foto?: string | null
  } | null
}

const initialForm: ProductFormState = {
  nombre_derivado: "",
  descripcion: "",
  categoria: "",
  nit: "",
  precio_sugerido: "",
  costo_produccion: "",
  estrella: false,
  activo: true,
}

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"

export function AdminProductsPanel() {
  const { user } = useAuth()
  const [form, setForm] = useState<ProductFormState>(initialForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingGaleriaId, setExistingGaleriaId] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductItem[]>([])
  const [productQuery, setProductQuery] = useState("")
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const editingProductRef = useRef<ProductEventPayload | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [companies, setCompanies] = useState<{ nit: string; nombre_comercial: string }[]>([])

  useEffect(() => {
    const loadCompanies = async () => {
      if (user?.role !== "admin") return

      try {
        const companyData = await ConsultarEmpresas()
        setCompanies(companyData ?? [])
      } catch (error) {
        console.error("Error cargando empresas:", error)
      }
    }

    void loadCompanies()
  }, [user?.role])

  const loadProducts = useCallback(async () => {
    if (user?.role !== "admin") return

    try {
      setIsLoadingProducts(true)
      const productData = await Consultar_Products()
      console.log("Productos cargados:", productData)
      setProducts(productData.products ?? [])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar los productos.")
    } finally {
      setIsLoadingProducts(false)
    }
  }, [user?.role])

  useEffect(() => {
    if (user?.role !== "admin") return

    void loadProducts()

    const handleEditProduct = (event: Event) => {
      const product = (event as CustomEvent<ProductEventPayload>).detail
      if (!product) return

      editingProductRef.current = product
      setForm({
        nombre_derivado: product.nombre_derivado ?? "",
        descripcion: product.descripcion ?? "",
        categoria: product.categoria ?? "",
        nit: product.nit ?? "",
        precio_sugerido: product.precio_sugerido == null ? "" : String(product.precio_sugerido),
        costo_produccion: product.costo_produccion == null ? "" : String(product.costo_produccion),
        estrella: !!product.estrella,
        activo: product.activo !== false,
      })
      setEditingId(product.id_producto)
      setExistingGaleriaId(product.galeria_fotos?.id_foto ?? null)
      setImageFile(null)
      setImagePreview(product.galeria_fotos?.url_foto ?? null)
      setMessage("")
      setErrorMessage("")

      document.getElementById("admin-productos")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    const handleToggleStar = async (event: Event) => {
      const product = (event as CustomEvent<ProductEventPayload>).detail
      if (!product) return

      const { error } = await supabase
        .from("productos_derivados")
        .update({ estrella: !product.estrella })
        .eq("id_producto", product.id_producto)

      if (!error) {
        window.dispatchEvent(new CustomEvent("product-saved"))
      } else {
        console.error("Error al actualizar destacado:", error.message)
      }
    }

    const handleToggleActive = async (event: Event) => {
      const product = (event as CustomEvent<ProductEventPayload>).detail
      if (!product) return

      const { error } = await supabase
        .from("productos_derivados")
        .update({ activo: product.activo === false })
        .eq("id_producto", product.id_producto)

      if (!error) {
        window.dispatchEvent(new CustomEvent("product-saved"))
      } else {
        console.error("Error al actualizar estado activo:", error.message)
      }
    }

    const handleDeleteProduct = async (event: Event) => {
      const product = (event as CustomEvent<ProductEventPayload>).detail
      if (!product) return

      const shouldDeactivate = window.confirm(`Seguro que deseas dar de baja el producto "${product.nombre_derivado}" del catalogo?`)
      if (!shouldDeactivate) return

      const { error } = await supabase
        .from("productos_derivados")
        .update({ activo: false })
        .eq("id_producto", product.id_producto)

      if (!error) {
        window.dispatchEvent(new CustomEvent("product-saved"))
      } else {
        alert(`No se pudo dar de baja el producto: ${error.message}`)
      }
    }

    window.addEventListener("edit-product", handleEditProduct)
    window.addEventListener("toggle-product-star", handleToggleStar)
    window.addEventListener("toggle-product-active", handleToggleActive)
    window.addEventListener("delete-product", handleDeleteProduct)
    window.addEventListener("product-saved", loadProducts)
    window.addEventListener("product-mutated", loadProducts)

    return () => {
      window.removeEventListener("edit-product", handleEditProduct)
      window.removeEventListener("toggle-product-star", handleToggleStar)
      window.removeEventListener("toggle-product-active", handleToggleActive)
      window.removeEventListener("delete-product", handleDeleteProduct)
      window.removeEventListener("product-saved", loadProducts)
      window.removeEventListener("product-mutated", loadProducts)
    }
  }, [loadProducts, user])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = productQuery.trim().toLowerCase()
    if (!normalizedQuery) return products

    return products.filter((product) =>
      [
        product.nombre_derivado,
        product.descripcion,
        product.categoria,
        product.nombre_comercial,
        product.nit,
        product.activo === false ? "inactivo oculto" : "activo visible",
        product.estrella ? "destacado estrella" : "",
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    )
  }, [productQuery, products])

  if (user?.role !== "admin") {
    return null
  }

  const handleChange =
    (field: keyof ProductFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCancelEdit = () => {
    setForm(initialForm)
    setEditingId(null)
    setExistingGaleriaId(null)
    editingProductRef.current = null
    removeImage()
    setMessage("")
    setErrorMessage("")
    window.dispatchEvent(new CustomEvent("product-saved"))
  }

  const toOptionalNumber = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
  }

  const saveProductCatalog = async (productId: string) => {
    const catalogBasePayload = {
      nit: form.nit,
      id_producto: productId,
      precio_sugerido: toOptionalNumber(form.precio_sugerido),
      costo_produccion: toOptionalNumber(form.costo_produccion),
    }

    const fallbackPayload = {
      nit: form.nit,
      id_producto: productId,
      precio_unitario: toOptionalNumber(form.precio_sugerido),
    }

    const minimalPayload = {
      nit: form.nit,
      id_producto: productId,
    }

    const existingCatalogId = editingProductRef.current?.id_catalogo ?? null

    if (existingCatalogId) {
      const primary = await supabase
        .from("catalogo_empresa")
        .update(catalogBasePayload)
        .eq("id_catalogo", existingCatalogId)

      if (!primary.error) return

      const fallback = await supabase
        .from("catalogo_empresa")
        .update(fallbackPayload)
        .eq("id_catalogo", existingCatalogId)

      if (!fallback.error) return

      const minimal = await supabase
        .from("catalogo_empresa")
        .update(minimalPayload)
        .eq("id_catalogo", existingCatalogId)

      if (minimal.error) throw new Error(minimal.error.message)
      return
    }

    const existing = await supabase
      .from("catalogo_empresa")
      .select("id_catalogo")
      .eq("id_producto", productId)
      .limit(1)
      .maybeSingle()

    if (existing.data?.id_catalogo) {
      editingProductRef.current = {
        ...(editingProductRef.current ?? { id_producto: productId }),
        id_catalogo: String(existing.data.id_catalogo),
      }
      await saveProductCatalog(productId)
      return
    }

    const primary = await supabase.from("catalogo_empresa").insert(catalogBasePayload)
    if (!primary.error) return

    const fallback = await supabase.from("catalogo_empresa").insert(fallbackPayload)
    if (!fallback.error) return

    const minimal = await supabase.from("catalogo_empresa").insert(minimalPayload)
    if (minimal.error) throw new Error(minimal.error.message)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage("")
    setErrorMessage("")

    try {
      let idGaleriaFoto: string | null = existingGaleriaId

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `productos/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("Galeria").upload(fileName, imageFile, { upsert: true })

        if (uploadError) {
          setErrorMessage(`Error al subir la imagen: ${uploadError.message}`)
          setIsSaving(false)
          return
        }

        const { data: publicData } = supabase.storage.from("Galeria").getPublicUrl(fileName)

        if (idGaleriaFoto) {
          const { error: galeriaError } = await supabase
            .from("galeria_fotos")
            .update({ url_foto: publicData.publicUrl })
            .eq("id_foto", idGaleriaFoto)

          if (galeriaError) {
            setErrorMessage(`Error al actualizar la imagen en galeria: ${galeriaError.message}`)
            setIsSaving(false)
            return
          }
        } else {
          const { data: galeriaData, error: galeriaError } = await supabase
            .from("galeria_fotos")
            .insert({ url_foto: publicData.publicUrl })
            .select("id_foto")
            .single()

          if (galeriaError || !galeriaData) {
            setErrorMessage(`Error al registrar la imagen: ${galeriaError?.message ?? "No se obtuvo id_foto"}`)
            setIsSaving(false)
            return
          }

          idGaleriaFoto = galeriaData.id_foto
        }
      }

      const payload: Record<string, unknown> = {
        nombre_derivado: form.nombre_derivado.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria.trim(),
        estrella: form.estrella,
        activo: form.activo,
      }

      if (!form.nit) {
        setErrorMessage("Selecciona la empresa responsable del producto.")
        setIsSaving(false)
        return
      }

      if (idGaleriaFoto) {
        payload.id_galeria_foto = idGaleriaFoto
      }

      const result = editingId
        ? await supabase.from("productos_derivados").update(payload).eq("id_producto", editingId).select("id_producto").single()
        : await supabase.from("productos_derivados").insert(payload).select("id_producto").single()

      if (result.error) {
        setErrorMessage(`No se pudo guardar el producto: ${result.error.message}`)
        setIsSaving(false)
        return
      }

      const productId = editingId ?? String(result.data?.id_producto ?? "")
      if (!productId) {
        setErrorMessage("El producto se guardo, pero no se pudo obtener su identificador para asociar la empresa.")
        setIsSaving(false)
        return
      }

      await saveProductCatalog(productId)

      setForm(initialForm)
      setEditingId(null)
      setExistingGaleriaId(null)
      editingProductRef.current = null
      removeImage()
      setMessage(editingId ? "Producto actualizado correctamente." : "Producto agregado correctamente.")
      window.dispatchEvent(new CustomEvent("product-saved"))
      void loadProducts()
    } catch (error) {
      setErrorMessage(`Error inesperado: ${String(error)}`)
    } finally {
      setIsSaving(false)
    }
  }

  const startEdit = (product: ProductItem) => {
    editingProductRef.current = {
      id_producto: product.id_producto,
      nombre_derivado: product.nombre_derivado,
      descripcion: product.descripcion,
      categoria: product.categoria,
      estrella: product.estrella,
      activo: product.activo,
      costo_produccion: product.costo_produccion,
    }
    setForm({
      nombre_derivado: product.nombre_derivado,
      descripcion: product.descripcion,
      categoria: product.categoria ?? "",
      nit: product.nit ?? "",
      precio_sugerido: product.precio_unitario == null ? "" : String(product.precio_unitario),
      costo_produccion: product.costo_produccion == null ? "" : String(product.costo_produccion),
      estrella: !!product.estrella,
      activo: product.activo !== false,
    })
    setEditingId(product.id_producto)
    setImageFile(null)
    setImagePreview(product.imagen_url)
    setMessage("")
    setErrorMessage("")
    document.getElementById("admin-productos")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const toggleProductFlag = async (product: ProductItem, field: "estrella" | "activo") => {
    setMessage("")
    setErrorMessage("")

    const nextValue = field === "estrella" ? !product.estrella : product.activo === false
    const { error } = await supabase
      .from("productos_derivados")
      .update({ [field]: nextValue })
      .eq("id_producto", product.id_producto)

    if (error) {
      setErrorMessage(`No se pudo actualizar el producto: ${error.message}`)
      return
    }

    setMessage(field === "estrella" ? "Producto destacado actualizado." : "Estado del producto actualizado.")
    await loadProducts()
    window.dispatchEvent(new CustomEvent("product-mutated"))
  }

  const deactivateProduct = async (product: ProductItem) => {
    const shouldDeactivate = window.confirm(`Seguro que deseas dar de baja el producto "${product.nombre_derivado}" del catalogo?`)
    if (!shouldDeactivate) return

    setMessage("")
    setErrorMessage("")

    const { error } = await supabase
      .from("productos_derivados")
      .update({ activo: false })
      .eq("id_producto", product.id_producto)

    if (error) {
      setErrorMessage(`No se pudo dar de baja el producto: ${error.message}`)
      return
    }

    setMessage("Producto dado de baja correctamente.")
    await loadProducts()
    window.dispatchEvent(new CustomEvent("product-mutated"))
  }

  return (
    <section id="admin-productos" className="bg-background px-4 sm:px-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest-light">
                <Tags size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.12em]">Catalogo comercial</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">Gestion de productos</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {editingId
                  ? "Edita el producto seleccionado y guarda los cambios para actualizar el catalogo."
                  : "Registra productos derivados con categoria, descripcion e imagen para el catalogo publico."}
              </p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <RotateCcw size={16} />
                Cancelar edicion
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre del producto">
                  <input
                    value={form.nombre_derivado}
                    onChange={handleChange("nombre_derivado")}
                    required
                    placeholder="Ej: Chocolate amargo 70%"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Categoria">
                  <select
                    value={form.categoria}
                    onChange={handleChange("categoria")}
                    required
                    className={inputClassName}
                  >
                    <option value="">Selecciona una categoria</option>
                    <option value="Alimento">Alimento</option>
                    <option value="Cosmetico">Cosmetico</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </Field>

                <Field label="Empresa responsable">
                  <select
                    value={form.nit}
                    onChange={handleChange("nit")}
                    required
                    className={inputClassName}
                  >
                    <option value="">Selecciona una empresa</option>
                    {companies.map((company) => (
                      <option key={company.nit} value={company.nit}>
                        {company.nombre_comercial} - {company.nit}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Precio sugerido">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio_sugerido}
                    onChange={handleChange("precio_sugerido")}
                    placeholder="Ej: 25000"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Costo de produccion">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costo_produccion}
                    onChange={handleChange("costo_produccion")}
                    placeholder="Ej: 12000"
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
                  <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={form.estrella}
                      onChange={(event) => setForm((current) => ({ ...current, estrella: event.target.checked }))}
                      className="h-4 w-4 accent-forest"
                    />
                    Producto destacado
                  </label>
                  <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={(event) => setForm((current) => ({ ...current, activo: event.target.checked }))}
                      className="h-4 w-4 accent-forest"
                    />
                    Visible en catalogo
                  </label>
                </div>
              </div>

              <Field label="Descripcion">
                <textarea
                  value={form.descripcion}
                  onChange={handleChange("descripcion")}
                  rows={7}
                  placeholder="Detalle de ingredientes, porcentaje de pureza, presentacion o ficha tecnica..."
                  className={`${inputClassName} resize-none`}
                />
              </Field>

              {message ? (
                <p className="rounded-2xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">
                  {message}
                </p>
              ) : null}
              {errorMessage ? (
                <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-semibold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {editingId ? <Save size={18} /> : <PlusCircle size={18} />}
                {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar producto"}
              </button>
            </div>

            <aside className="rounded-2xl border border-border bg-background/35 p-4">
              <div className="mb-4 flex items-center gap-2">
                <PackagePlus size={18} className="text-forest-light" />
                <h3 className="text-sm font-semibold text-foreground">Imagen del producto</h3>
              </div>
              {!imagePreview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card text-center text-muted-foreground transition hover:border-forest hover:text-forest"
                >
                  <ImagePlus size={26} />
                  <span className="text-sm font-medium">Seleccionar imagen</span>
                </button>
              ) : (
                <div className="space-y-3">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="aspect-[4/3] w-full rounded-xl border border-border object-cover shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow transition hover:bg-red-600"
                    title="Quitar imagen"
                  >
                      <X size={14} />
                    </button>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-forest px-4 text-sm font-semibold text-forest-light transition hover:bg-forest/10"
                >
                  <ImagePlus size={16} />
                  Cambiar imagen
                </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <p className="mt-3 text-xs text-muted-foreground">
                La imagen se sube a Supabase Storage y queda vinculada al producto.
              </p>
            </aside>
          </form>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground">Productos registrados</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLoadingProducts ? "Cargando catalogo..." : `${filteredProducts.length} productos visibles en esta vista.`}
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 pl-9 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                placeholder="Buscar producto o categoria"
              />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Empresa</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Destacado</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id_producto} className="border-b border-border/40 text-sm">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imagen_url || "/images/cacao-beans.jpg"}
                          alt={product.nombre_derivado}
                          className="h-12 w-14 rounded-lg border border-border object-cover"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{product.nombre_derivado}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{product.descripcion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-foreground">{product.nombre_comercial ?? "Sin empresa"}</p>
                      <p className="text-xs text-muted-foreground">{product.nit ? `NIT ${product.nit}` : "Responsable pendiente"}</p>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{product.categoria ?? product.tag}</td>
                    <td className="px-3 py-3">
                      <span className={product.activo === false ? "rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200" : "rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest-light"}>
                        {product.activo === false ? "Inactivo" : "Activo"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={product.estrella ? "inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200" : "text-xs text-muted-foreground"}>
                        {product.estrella ? (
                          <>
                            <Star size={13} fill="currentColor" />
                            Si
                          </>
                        ) : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <p>{product.precio_unitario ? `$${product.precio_unitario.toLocaleString("es-CO")}` : "Sin precio"}</p>
                      <p className="text-xs">Costo: {product.costo_produccion ? `$${product.costo_produccion.toLocaleString("es-CO")}` : "Sin costo"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => startEdit(product)} className="product-icon-button" title="Editar producto">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => void toggleProductFlag(product, "estrella")} className="product-icon-button" title="Cambiar destacado">
                          <Star size={15} />
                        </button>
                        <button type="button" onClick={() => void toggleProductFlag(product, "activo")} className="product-icon-button" title={product.activo === false ? "Activar producto" : "Ocultar producto"}>
                          {product.activo === false ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button type="button" onClick={() => void deactivateProduct(product)} className="product-icon-button text-red-200 hover:border-red-300/50 hover:bg-red-500/10" title="Dar de baja producto">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoadingProducts && filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      No hay productos para mostrar.
                    </td>
                  </tr>
                ) : null}
                {isLoadingProducts ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      Cargando productos...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
