"use client"

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react"
import { PlusCircle, ShieldCheck, ImagePlus, X, Save, RotateCcw } from "lucide-react"

import { useAuth } from "@/controller/auth-controller"
import { supabase } from "@/services/client"

interface ProductFormState {
  nombre_derivado: string
  descripcion: string
  categoria: string
}

const initialForm: ProductFormState = {
  nombre_derivado: "",
  descripcion: "",
  categoria: "",
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingGaleriaId, setExistingGaleriaId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== "admin") return

    const handleEditProduct = (e: CustomEvent<any>) => {
      const product = e.detail
      if (!product) return

      // Populate form
      setForm({
        nombre_derivado: product.nombre_derivado ?? "",
        descripcion: product.descripcion ?? "",
        categoria: product.categoria ?? "",
      })
      setEditingId(product.id_producto)
      setExistingGaleriaId(product.galeria_fotos?.id_foto ?? null)
      setImageFile(null)
      setImagePreview(product.galeria_fotos?.url_foto ?? null)
      setMessage("")
      setErrorMessage("")

      // Scroll to the admin panel smoothly
      const element = document.getElementById("admin-productos")
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }

    window.addEventListener("edit-product" as any, handleEditProduct)
    return () => {
      window.removeEventListener("edit-product" as any, handleEditProduct)
    }
  }, [user])

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
    // If we are editing, we don't necessarily delete the reference, just don't send a new one
    // unless the user uploads another one. We will preserve existingGaleriaId if they don't change it.
  }

  const handleCancelEdit = () => {
    setForm(initialForm)
    setEditingId(null)
    setExistingGaleriaId(null)
    removeImage()
    setMessage("")
    setErrorMessage("")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage("")
    setErrorMessage("")

    try {
      let id_galeria_foto: string | null = existingGaleriaId

      // 1. If a new image was selected, upload it and get/update galeria_fotos reference
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `productos/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from("Galeria")
          .upload(fileName, imageFile, { upsert: true })

        if (uploadError) {
          setErrorMessage(`Error al subir la imagen: ${uploadError.message}`)
          setIsSaving(false)
          return
        }

        const { data: publicData } = supabase.storage
          .from("Galeria")
          .getPublicUrl(fileName)

        if (id_galeria_foto) {
          // Update existing image record
          const { error: galeriaError } = await supabase
            .from("galeria_fotos")
            .update({ url_foto: publicData.publicUrl })
            .eq("id_foto", id_galeria_foto)

          if (galeriaError) {
            setErrorMessage(`Error al actualizar la imagen en la galería: ${galeriaError.message}`)
            setIsSaving(false)
            return
          }
        } else {
          // Create new record in galeria_fotos and get its id
          const { data: galeriaData, error: galeriaError } = await supabase
            .from("galeria_fotos")
            .insert({ url_foto: publicData.publicUrl })
            .select("id_foto")
            .single()

          if (galeriaError) {
            setErrorMessage(`Error al registrar la imagen: ${galeriaError.message}`)
            setIsSaving(false)
            return
          }

          id_galeria_foto = galeriaData.id_foto
        }
      }

      // 2. Insert or update the product
      const payload: Record<string, any> = {
        nombre_derivado: form.nombre_derivado.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria.trim(),
      }
      
      // If we have a gallery ID (either existing or newly created/updated), send it
      if (id_galeria_foto) {
        payload.id_galeria_foto = id_galeria_foto
      }

      if (editingId) {
        // Edit mode
        const { error } = await supabase
          .from("productos_derivados")
          .update(payload)
          .eq("id_producto", editingId)

        if (error) {
          setErrorMessage(`No se pudo actualizar el producto: ${error.message}`)
          setIsSaving(false)
          return
        }

        setMessage("✓ Producto actualizado correctamente.")
        setEditingId(null)
        setExistingGaleriaId(null)
      } else {
        // Add mode
        const { error } = await supabase.from("productos_derivados").insert(payload)

        if (error) {
          setErrorMessage(`No se pudo guardar el producto: ${error.message}`)
          setIsSaving(false)
          return
        }

        setMessage("✓ Producto agregado correctamente.")
      }

      // Reset form and dispatch refresh event
      setForm(initialForm)
      removeImage()
      window.dispatchEvent(new CustomEvent("product-saved"))
    } catch (err) {
      setErrorMessage(`Error inesperado: ${String(err)}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section id="admin-productos" className="border-y border-border bg-background py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold uppercase tracking-widest">Administrador</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">
                {editingId ? "Actualizar producto" : "Agregar productos"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {editingId 
                  ? "Modifica los campos del producto seleccionado y guarda los cambios."
                  : "Este formulario inserta directamente en Supabase (productos_derivados)."
                }
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-2 self-start sm:self-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <RotateCcw size={16} />
                Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Fila 1: Nombre y Categoría */}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre del producto">
                <input
                  value={form.nombre_derivado}
                  onChange={handleChange("nombre_derivado")}
                  required
                  placeholder='Ej: Chocolate amargo 70%'
                  className={inputClassName}
                />
              </Field>

              <Field label="Categoría">
                <select
                  value={form.categoria}
                  onChange={handleChange("categoria")}
                  required
                  className={inputClassName}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Alimento">Alimento</option>
                  <option value="Cosmético">Cosmético</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </Field>
            </div>

            {/* Descripción */}
            <Field label="Descripción">
              <textarea
                value={form.descripcion}
                onChange={handleChange("descripcion")}
                rows={4}
                placeholder="Detalle de ingredientes, porcentaje de pureza o ficha técnica..."
                className={`${inputClassName} resize-none`}
              />
            </Field>

            {/* Imagen */}
            <Field label="Imagen del producto">
              <div className="flex flex-col gap-3">
                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background text-muted-foreground transition hover:border-forest hover:text-forest"
                  >
                    <ImagePlus size={22} />
                    <span className="text-sm font-medium">Haz clic para seleccionar imagen</span>
                  </button>
                ) : (
                  <div className="relative w-40">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-40 rounded-xl border border-border object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow transition hover:bg-red-600"
                    >
                      <X size={14} />
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
                <p className="text-xs text-muted-foreground">
                  Se subirá al Storage de Supabase y se vinculará mediante <code>id_galeria_foto</code>.
                </p>
              </div>
            </Field>

            {message && (
              <p className="rounded-2xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">
                {message}
              </p>
            )}
            {errorMessage && (
              <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {editingId ? <Save size={18} /> : <PlusCircle size={18} />}
              {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar producto"}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
