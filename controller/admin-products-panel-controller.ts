"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"

import { useAuth } from "@/controller/auth-controller"
import { initialProductForm, type ProductFormState } from "@/model/products"
import { supabase } from "@/services/client"
import { DICTIONARY_TABLES } from "@/services/dictionary-db"

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
      id_producto: `prod-${Date.now()}`,
      nombre_derivado: form.nombre_derivado.trim(),
      descripcion: form.descripcion.trim() || null,
      categoria: form.tag.trim() || "Alimento",
    }

    const { error } = await supabase.from(DICTIONARY_TABLES.productosDerivados[0]).insert(payload)

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
    setForm,
    setMessage,
    setErrorMessage,
    setIsSaving,
    handleChange,
    handleSubmit,
  }
}
