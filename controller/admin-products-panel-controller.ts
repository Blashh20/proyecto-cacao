"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"

import { useAuth } from "@/controller/auth-controller"
import { initialProductForm, type ProductFormState } from "@/model/products"
import { supabase } from "@/services/client"

export function useAdminProductsPanelController() {
  const { user } = useAuth()
  const [form, setForm] = useState<ProductFormState>(initialProductForm)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (field: keyof ProductFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage("")
    setErrorMessage("")

    const payload = {
      nombre_derivado: form.nombre_derivado.trim(),
      descripcion: form.descripcion.trim(),
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

    setForm(initialProductForm)
    setMessage("Producto agregado correctamente.")
    setIsSaving(false)
  }

  return {
    user,
    form,
    isSaving,
    message,
    errorMessage,
    handleChange,
    handleSubmit,
  }
}
