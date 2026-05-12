"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { PlusCircle, ShieldCheck, X } from "lucide-react"

import { useAdminProductsPanelController } from "@/controller/admin-products-panel-controller"

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"

export function AdminProductsPanel() {
  const { user, form, isSaving, message, errorMessage } = useAdminProductsPanelController()

  if (user?.role !== "admin") {
    return null
  }

  const handleChange = (field: keyof ProductFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height
          const MAX_DIMENSION = 800

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width
              width = MAX_DIMENSION
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height
              height = MAX_DIMENSION
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL("image/webp", 0.7))
          } else {
            resolve(e.target?.result as string)
          }
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newImages = await Promise.all(Array.from(files).map(compressImage))
    
    setForm((current) => {
      const currentImages = current.imagen_url === "/images/cacao-beans.jpg" || current.imagen_url.trim() === ""
        ? [] 
        : current.imagen_url.split("|")
      return { ...current, imagen_url: [...currentImages, ...newImages].join("|") }
    })
  }

  const removeImage = (index: number) => {
    setForm((current) => {
      const currentImages = current.imagen_url.split("|")
      currentImages.splice(index, 1)
      return { ...current, imagen_url: currentImages.join("|") }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage("")
    setErrorMessage("")

    const payload = {
      nombre_derivado: form.nombre_derivado.trim(),
      description: form.descripcion.trim(),
      imagen_url: form.imagen_url.trim(),
      tag: form.tag.trim(),
      rating: Number(form.rating),
    }

    const { error } = await supabase.from("productos_derivados").insert(payload)

    if (error) {
      setErrorMessage(`No se pudo guardar el producto: ${error.message}`)
      setIsSaving(false)
      return
    }

    setForm(initialForm)
    setMessage("Producto agregado correctamente.")
    setIsSaving(false)
  }

  return (
    <section id="admin-productos" className="border-y border-border bg-background py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-forest/10 px-4 py-2 text-forest">
              <ShieldCheck size={18} />
              <span className="text-sm font-semibold uppercase tracking-widest">Administrador</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground sm:text-3xl">Agregar productos</h2>
            <p className="mt-2 text-muted-foreground">Este formulario inserta directamente en Supabase (`productos_derivados`).</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre del producto">
                <input value={form.nombre_derivado} onChange={handleChange("nombre_derivado")} required className={inputClassName} />
              </Field>
              <Field label="Tag">
                <input value={form.tag} onChange={handleChange("tag")} required className={inputClassName} placeholder="Premium" />
              </Field>
              <Field label="Rating">
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange("rating")} required className={inputClassName} />
              </Field>
              <Field label="Imágenes del producto">
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="text-sm file:mr-4 file:rounded-full file:border-0 file:bg-forest/10 file:px-4 file:py-2 file:font-semibold file:text-forest hover:file:bg-forest/20"
                  />
                  {form.imagen_url && form.imagen_url !== "/images/cacao-beans.jpg" && (
                    <div className="grid grid-cols-4 gap-2">
                      {form.imagen_url.split("|").map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Preview ${index}`} className="h-16 w-full rounded-md object-cover border border-border" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.imagen_url === "/images/cacao-beans.jpg" && (
                     <p className="text-xs text-muted-foreground">Imagen por defecto. Sube archivos para cambiarla.</p>
                  )}
                </div>
              </Field>
            </div>

            <Field label="Descripcion">
              <textarea value={form.descripcion} onChange={handleChange("descripcion")} rows={4} required className={`${inputClassName} resize-none`} />
            </Field>

            {message ? <p className="rounded-2xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-foreground">{message}</p> : null}
            {errorMessage ? <p className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              <PlusCircle size={18} />
              {isSaving ? "Guardando..." : "Guardar producto"}
            </button>
          </form>
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
