"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"

import { useAuth } from "@/controller/auth-controller"
import { ProductItem} from "@/model/products"
import { crearProducto } from "@/services/products-service"

const initialProductForm = {} as ProductItem

export function crear_producto_admin() {
  const { user } = useAuth()
  const [form, setForm] = useState<ProductItem>(initialProductForm)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (field: keyof ProductItem) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setMessage("")
    setErrorMessage("")


    const {error} = await crearProducto(form, form.nit)

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
