"use client"

import { FileText, Shield, UserRound } from "lucide-react"
import Image from "next/image"
import type { ChangeEvent } from "react"

import { uploadImage } from "@/services/storage"
import { IDENTIFICATION_TYPES } from "@/ui/components/dashboard/profile-catalogs"
import { ProfileInput } from "@/ui/components/dashboard/profile-input"
import { ProfileSelect } from "@/ui/components/dashboard/profile-select"

type ProfileForm = {
  primer_nombre: string
  segundo_nombre: string
  primer_apellido: string
  segundo_apellido: string
  tipo_identificacion: string
  numero_identificacion: string
  telefono_celular: string
  foto_url: string
}

// Edita los datos maestros del usuario y carga la foto de perfil en Supabase Storage.
export function ProfileFormTab({
  form,
  setForm,
  onSubmit,
}: {
  form: ProfileForm
  setForm: (next: (prev: ProfileForm) => ProfileForm) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest/10 text-forest">
          <UserRound size={22} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Datos maestros</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Estos campos identifican al usuario dentro del flujo comercial. Los valores sensibles se capturan con listas controladas cuando aplica.
        </p>
      </aside>

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-forest">
            <FileText size={19} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Identidad y contacto</h3>
            <p className="text-sm text-muted-foreground">Mantiene trazabilidad para compras, pagos y solicitudes de proyecto.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ProfileInput label="Primer nombre" value={form.primer_nombre} onChange={(value) => setForm((s) => ({ ...s, primer_nombre: value }))} />
          <ProfileInput label="Segundo nombre" value={form.segundo_nombre} onChange={(value) => setForm((s) => ({ ...s, segundo_nombre: value }))} />
          <ProfileInput label="Primer apellido" value={form.primer_apellido} onChange={(value) => setForm((s) => ({ ...s, primer_apellido: value }))} />
          <ProfileInput label="Segundo apellido" value={form.segundo_apellido} onChange={(value) => setForm((s) => ({ ...s, segundo_apellido: value }))} />
          <ProfileSelect
            label="Tipo de identificacion"
            value={form.tipo_identificacion}
            onChange={(value) => setForm((s) => ({ ...s, tipo_identificacion: value }))}
            options={IDENTIFICATION_TYPES.map((item) => ({ value: item.value, label: item.label }))}
            placeholder="Selecciona tipo"
          />
          <ProfileInput label="Numero de documento" value={form.numero_identificacion} onChange={(value) => setForm((s) => ({ ...s, numero_identificacion: value }))} />
          <ProfileInput
            label="Telefono celular"
            value={form.telefono_celular}
            onChange={(value) => setForm((s) => ({ ...s, telefono_celular: value.replace(/[^\d+\s-]/g, "") }))}
          />
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Foto de perfil</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-background">
                <Image src={form.foto_url || "/images/cacao-pods.jpg"} alt="Preview" width={64} height={64} className="object-cover" />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const publicUrl = await uploadImage(file)
                      setForm((s) => ({ ...s, foto_url: publicUrl }))
                      console.log("Imagen subida con exito:", publicUrl)
                    } catch (err) {
                      console.error("Error subiendo imagen:", err)
                      alert("No se pudo subir la imagen. Intenta nuevamente.")
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white hover:bg-forest-dark">
              <Shield size={16} />
              Guardar perfil
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
